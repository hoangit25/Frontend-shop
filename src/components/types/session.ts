export interface Session {
  userId: string;
  refreshToken: string;
  ipAddress: string;
  userAgent: string;
  deviceName: string;
  isRevoked: boolean;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface BlackListToken {
  jti: string;
  userId?: string;
  sessionId?: string;
  reason?: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface UserPayLoad {
  id: string;
  email: string;
}

export interface AccessTokenPayLoad {
  id: string;
  email: string;
  jti: string;
  sessionId?: string;
  type: "access";
}

export interface RefreshTokenPayLoad {
  id: string;
  email: string;
  sessionId?: string;
}

export interface LoginPayLoad {
  email: string;
  password: string;
}
