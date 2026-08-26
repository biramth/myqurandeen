export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  locale: string;
  memberSince: string;
}

export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
}
