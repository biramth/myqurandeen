import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import type { Request, Response } from "express";
import { Public } from "../../common/decorators/public.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { RequestUser } from "../../common/types/authenticated-request";
import { UsersService } from "../users/users.service";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { ResendVerificationDto, VerifyEmailDto } from "./dto/verify-email.dto";
import { clearRefreshCookie, REFRESH_COOKIE_NAME, setRefreshCookie } from "./refresh-cookie.util";

const OAUTH_STATE_COOKIE = "oauth_state";
const OAUTH_VERIFIER_COOKIE = "oauth_verifier";

function oauthCookieOptions() {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? ("none" as const) : ("lax" as const),
    path: "/auth/google",
    maxAge: 10 * 60 * 1000, // 10 min, le temps du flow OAuth
  };
}

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post("register")
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const { user, tokens } = await this.authService.register(dto);
    setRefreshCookie(res, tokens.refreshToken);
    return { user, accessToken: tokens.accessToken };
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { user, tokens } = await this.authService.login(dto);
    setRefreshCookie(res, tokens.refreshToken);
    return { user, accessToken: tokens.accessToken };
  }

  @Public()
  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];
    if (!refreshToken) {
      throw new UnauthorizedException("Refresh token manquant");
    }
    const tokens = await this.authService.refresh(refreshToken);
    setRefreshCookie(res, tokens.refreshToken);
    return { accessToken: tokens.accessToken };
  }

  @Public()
  @Post("logout")
  @HttpCode(HttpStatus.NO_CONTENT)
  logout(@Res({ passthrough: true }) res: Response) {
    clearRefreshCookie(res);
  }

  @Public()
  @Post("verify-email")
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto.token);
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post("resend-verification")
  @HttpCode(HttpStatus.OK)
  async resendVerification(@Body() dto: ResendVerificationDto) {
    return this.authService.resendVerification(dto.email);
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post("forgot-password")
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Public()
  @Post("reset-password")
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  // --- Google OAuth ---

  @Public()
  @Get("google/config")
  googleConfig() {
    return this.authService.isGoogleConfigured ? { enabled: true, clientId: this.authService.googleClientId } : { enabled: false };
  }

  @Public()
  @Get("google")
  google(@Res() res: Response) {
    if (!this.authService.isGoogleConfigured) {
      throw new BadRequestException("Connexion Google non configuree");
    }
    const { url, state, codeVerifier } = this.authService.buildOAuthSession();
    res.cookie(OAUTH_STATE_COOKIE, state, oauthCookieOptions());
    res.cookie(OAUTH_VERIFIER_COOKIE, codeVerifier, oauthCookieOptions());
    res.redirect(url);
  }

  @Public()
  @Get("google/callback")
  async googleCallback(@Req() req: Request, @Query("code") code: string, @Query("state") state: string, @Res() res: Response) {
    const storedState = req.cookies?.[OAUTH_STATE_COOKIE];
    const codeVerifier = req.cookies?.[OAUTH_VERIFIER_COOKIE];
    if (!storedState || !codeVerifier || storedState !== state || !code) {
      clearOAuthCookies(res);
      return res.redirect(frontendUrl() + "/login?google=error");
    }
    try {
      const { tokens } = await this.authService.googleCallback(code, codeVerifier);
      clearOAuthCookies(res);
      setRefreshCookie(res, tokens.refreshToken);
      return res.redirect(frontendUrl() + "/oauth/google/callback");
    } catch {
      clearOAuthCookies(res);
      return res.redirect(frontendUrl() + "/login?google=error");
    }
  }

  @Get("me")
  async me(@CurrentUser() currentUser: RequestUser) {
    const user = await this.usersService.findById(currentUser.sub);
    if (!user) {
      throw new UnauthorizedException("Utilisateur introuvable");
    }
    return this.usersService.toPublicProfile(user, currentUser.roleName);
  }
}

function frontendUrl(): string {
  const webUrl = process.env.WEB_URL ?? "http://localhost:5173";
  return webUrl.replace(/\/+$/, "");
}

function clearOAuthCookies(res: Response): void {
  res.clearCookie(OAUTH_STATE_COOKIE, oauthCookieOptions());
  res.clearCookie(OAUTH_VERIFIER_COOKIE, oauthCookieOptions());
}
