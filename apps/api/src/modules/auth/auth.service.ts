import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import type { StringValue } from "ms";
import type { PermissionValue, RoleName } from "@qurandeen/shared";
import { UsersService } from "../users/users.service";
import { RbacService } from "../rbac/rbac.service";
import type { LoginDto } from "./dto/login.dto";
import type { RegisterDto } from "./dto/register.dto";

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

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly rbacService: RbacService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<{ user: ReturnType<UsersService["toPublicProfile"]>; tokens: AuthTokens }> {
    const user = await this.usersService.createUser(dto);
    const { tokens, roleName } = await this.issueTokens(user.id, user.email, user.roleId);
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

    const { tokens } = await this.issueTokens(user.id, user.email, user.roleId);
    return tokens;
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
