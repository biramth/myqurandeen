export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  locale: string;
  memberSince: string;
  emailVerified: boolean;
  avatarUrl: string | null;
  /** True si l'utilisateur a un role permettant d'acceder au tableau de bord d'administration. */
  isStaff?: boolean;
}

export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
}
