import {
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import type { StringValue } from "ms";
import type { PermissionValue, RoleName } from "@qurandeen/shared";
import { randomBytes, createHash } from "node:crypto";
import { UsersService } from "../users/users.service";
import { RbacService } from "../rbac/rbac.service";
import { MailService } from "../mail/mail.service";
import { AuthTokensService } from "./auth-tokens.service";
import type { LoginDto } from "./dto/login.dto";
import type { RegisterDto } from "./dto/register.dto";
import type { ForgotPasswordDto } from "./dto/forgot-password.dto";
import type { ResetPasswordDto } from "./dto/reset-password.dto";

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface JwtPayload {
  sub: string;
  email: string;
  roleName: RoleName;
  permissions: PermissionValue[];
}

export interface GoogleUserProfile {
  sub: string;
  email: string;
  name: string;
  picture?: string;
}

export class EmailNotVerifiedError extends ForbiddenException {
  constructor() {
    super("EMAIL_NOT_VERIFIED");
  }
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly rbacService: RbacService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly authTokensService: AuthTokensService,
    private readonly config: ConfigService,
  ) {}

  get isGoogleConfigured(): boolean {
    return Boolean(this.config.get("GOOGLE_CLIENT_ID") && this.config.get("GOOGLE_CLIENT_SECRET"));
  }

  get googleClientId(): string {
    return this.config.get("GOOGLE_CLIENT_ID", "");
  }

  async register(dto: RegisterDto): Promise<{ user: ReturnType<UsersService["toPublicProfile"]>; tokens: AuthTokens }> {
    const user = await this.usersService.createUser(dto);
    const { tokens, roleName } = await this.issueTokens(user.id, user.email, user.roleId);
    // Le compte est deja cree en base a ce stade : un echec d'envoi (panne
    // Resend, domaine mal configure...) ne doit jamais faire echouer
    // l'inscription elle-meme, sinon l'utilisateur se retrouve avec un compte
    // orphelin (email deja pris) qu'il ne peut ni utiliser (email non
    // verifie) ni recreer, sans le savoir. On loggue et on continue : il
    // pourra toujours redemander l'email via "resend-verification".
    try {
      await this.sendVerificationEmail(user.id, user.email);
    } catch (error) {
      this.logger.error(`Echec d'envoi de l'email de verification a l'inscription (${user.email})`, error instanceof Error ? error.stack : error);
    }
    return { user: this.usersService.toPublicProfile(user, roleName), tokens };
  }

  async login(dto: LoginDto): Promise<{ user: ReturnType<UsersService["toPublicProfile"]>; tokens: AuthTokens }> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user || !user.isActive) {
      throw new UnauthorizedException("Identifiants invalides");
    }

    const validPassword = await this.usersService.verifyPassword(user, dto.password);
    if (!validPassword) {
      throw new UnauthorizedException("Identifiants invalides");
    }

    if (!user.emailVerifiedAt) {
      throw new EmailNotVerifiedError();
    }

    const { tokens, roleName } = await this.issueTokens(user.id, user.email, user.roleId);
    return { user: this.usersService.toPublicProfile(user, roleName), tokens };
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
    } catch {
      throw new UnauthorizedException("Refresh token invalide ou expire");
    }

    const user = await this.usersService.findById(payload.sub);
    if (!user || !user.isActive) {
      throw new UnauthorizedException("Compte introuvable ou desactive");
    }

    // Ne pas permettre un refresh sur un compte dont l'email n'est pas verifie.
    if (!user.emailVerifiedAt) {
      throw new ForbiddenException("EMAIL_NOT_VERIFIED");
    }

    const { tokens } = await this.issueTokens(user.id, user.email, user.roleId);
    return tokens;
  }

  async verifyEmail(token: string): Promise<{ emailVerified: boolean }> {
    const userId = await this.authTokensService.consume(token, "email_verify");
    await this.usersService.markEmailVerified(userId);
    return { emailVerified: true };
  }

  /** Renvoie un lien de verification pour un email donne (reponse generique). */
  async resendVerification(email: string): Promise<{ sent: boolean }> {
    const user = await this.usersService.findByEmail(email);
    if (!user || user.emailVerifiedAt || !user.isActive) {
      // Reponse generique pour ne pas reveler l'existence d'un compte.
      return { sent: false };
    }
    // Idem register() : un echec d'envoi ne doit pas se distinguer du cas
    // "compte inexistant" cote reponse HTTP (sinon l'existence du compte se
    // devine selon qu'une erreur serveur survient ou non).
    try {
      await this.sendVerificationEmail(user.id, user.email);
    } catch (error) {
      this.logger.error(`Echec de renvoi de l'email de verification (${user.email})`, error instanceof Error ? error.stack : error);
    }
    return { sent: true };
  }

  /** Demande un reset de mot de passe (reponse generique). */
  async forgotPassword(dto: ForgotPasswordDto): Promise<{ sent: boolean }> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user || !user.emailVerifiedAt || !user.isActive) {
      return { sent: false };
    }
    const ttl = Number(this.config.get("RESET_TOKEN_TTL_SECONDS", "3600"));
    const token = await this.authTokensService.create(user.id, "password_reset", ttl);
    const webUrl = this.config.get("WEB_URL", "http://localhost:5173");
    const resetUrl = `${webUrl}/reset-password?token=${encodeURIComponent(token)}`;
    const { subject, html } = this.mailService.buildResetEmail(resetUrl);
    try {
      await this.mailService.send(user.email, subject, html);
    } catch (error) {
      this.logger.error(`Echec d'envoi de l'email de reinitialisation (${user.email})`, error instanceof Error ? error.stack : error);
    }
    return { sent: true };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ success: boolean }> {
    const userId = await this.authTokensService.consume(dto.token, "password_reset");
    const user = await this.usersService.findById(userId);
    if (!user || !user.isActive) {
      throw new UnauthorizedException("Compte introuvable ou desactive");
    }
    await this.usersService.updatePassword(user.id, dto.password);
    // Invalider tous les refresh tokens existants n'est pas possible avec des
    // JWT stateless sans rotation cote serveur ; a minima, on garde la
    // rotation du refresh cookie. Les anciens access tokens (=15 min) restent
    // valides brievement, accepte pour ce MVP.
    return { success: true };
  }

  // --- Google OAuth ---

  /**
   * Prepare un flux OAuth "Sign in with Google" en redirect (PKCE).
   * Renvoie l'URL de redirection et les valeurs a conserver cote navigateur
   * (state anti-CSRF + code_verifier) via des cookies httpOnly.
   */
  buildOAuthSession(): { url: string; state: string; codeVerifier: string } {
    const state = randomBytes(16).toString("base64url");
    const codeVerifier = randomBytes(32).toString("base64url");
    const url = this.buildGoogleAuthUrl(state, codeVerifier);
    return { url, state, codeVerifier };
  }

  private buildGoogleAuthUrl(state: string, codeVerifier: string): string {
    const codeChallenge = createHash("sha256").update(codeVerifier).digest("base64url");
    const params = new URLSearchParams({
      client_id: this.googleClientId,
      redirect_uri: this.config.get("GOOGLE_CALLBACK_URL", ""),
      response_type: "code",
      scope: "openid email profile",
      state,
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
      access_type: "online",
      prompt: "select_account",
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  async googleCallback(code: string, codeVerifier: string): Promise<{
    user: ReturnType<UsersService["toPublicProfile"]>;
    roleName: RoleName;
    tokens: AuthTokens;
  }> {
    const tokenEndpoint = "https://oauth2.googleapis.com/token";
    const tokenResponse = await fetch(tokenEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: this.googleClientId,
        client_secret: this.config.get("GOOGLE_CLIENT_SECRET", ""),
        redirect_uri: this.config.get("GOOGLE_CALLBACK_URL", ""),
        grant_type: "authorization_code",
        code_verifier: codeVerifier,
      }),
    });

    if (!tokenResponse.ok) {
      throw new UnauthorizedException("Echec de l'echange du code Google");
    }
    const data = (await tokenResponse.json()) as { id_token?: string; access_token?: string };

    // On prefer le profil via userinfo (access_token) : l'id_token est un JWT
    // dont on ne valide pas la signature ici sans bibliotheque dediee, tandis
    // que userinfo est verifie TLS cote Google.
    let profile: GoogleUserProfile;
    if (data.access_token) {
      profile = await this.fetchGoogleProfile(data.access_token);
    } else if (data.id_token) {
      profile = this.decodeIdTokenProfile(data.id_token);
    } else {
      throw new UnauthorizedException("Aucun jeton Google recu");
    }

    const { user, created } = await this.usersService.findOrCreateGoogleUser({
      googleId: profile.sub,
      email: profile.email,
      displayName: profile.name || profile.email.split("@")[0],
      avatarUrl: profile.picture,
    });
    return this.issueTokensForUser(user, created);
  }

  private async issueTokensForUser(
    user: NonNullable<Awaited<ReturnType<UsersService["findByEmail"]>>>,
    _created: boolean,
  ): Promise<{ user: ReturnType<UsersService["toPublicProfile"]>; roleName: RoleName; tokens: AuthTokens }> {
    const { tokens, roleName } = await this.issueTokens(user.id, user.email, user.roleId);
    return { user: this.usersService.toPublicProfile(user, roleName), roleName, tokens };
  }

  private decodeIdTokenProfile(idToken: string): GoogleUserProfile {
    const parts = idToken.split(".");
    if (parts.length !== 3) {
      throw new UnauthorizedException("id_token Google invalide");
    }
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8")) as {
      sub?: string;
      email?: string;
      name?: string;
      picture?: string;
    };
    if (!payload.sub || !payload.email) {
      throw new UnauthorizedException("id_token Google incomplet");
    }
    return {
      sub: payload.sub,
      email: payload.email,
      name: payload.name ?? "",
      picture: payload.picture,
    };
  }

  private async fetchGoogleProfile(accessToken: string): Promise<GoogleUserProfile> {
    const profile = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!profile.ok) {
      throw new UnauthorizedException("Impossible de recuperer le profil Google");
    }
    const data = (await profile.json()) as {
      sub?: string;
      email?: string;
      name?: string;
      picture?: string;
    };
    if (!data.sub || !data.email) {
      throw new UnauthorizedException("Profil Google incomplet");
    }
    return { sub: data.sub, email: data.email, name: data.name ?? "", picture: data.picture };
  }

  private async sendVerificationEmail(userId: string, email: string) {
    const ttl = Number(this.config.get("VERIFY_TOKEN_TTL_SECONDS", "3600"));
    const token = await this.authTokensService.create(userId, "email_verify", ttl);
    const webUrl = this.config.get("WEB_URL", "http://localhost:5173");
    const verifyUrl = `${webUrl}/verify-email?token=${encodeURIComponent(token)}`;
    const { subject, html } = this.mailService.buildVerificationEmail(verifyUrl);
    await this.mailService.send(email, subject, html);
  }

  private async issueTokens(
    userId: string,
    email: string,
    roleId: string,
  ): Promise<{ tokens: AuthTokens; roleName: RoleName }> {
    const roleWithPermissions = await this.rbacService.getRoleWithPermissions(roleId);
    if (!roleWithPermissions) {
      throw new UnauthorizedException("Role introuvable pour cet utilisateur");
    }

    const payload: JwtPayload = {
      sub: userId,
      email,
      roleName: roleWithPermissions.roleName,
      permissions: roleWithPermissions.permissions,
    };

    // `expiresIn` est type par jsonwebtoken comme une union litterale de chaines
    // ("15m", "30d"...) ; la valeur vient de l'environnement (deja validee par
    // env.validation.ts au demarrage), d'ou ce cast cible plutot qu'un `any` large.
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: (process.env.JWT_ACCESS_TTL ?? "15m") as StringValue,
    });
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: (process.env.JWT_REFRESH_TTL ?? "30d") as StringValue,
    });

    return { tokens: { accessToken, refreshToken }, roleName: roleWithPermissions.roleName };
  }
}
