interface Session{
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

interface BlackListToken{
jti: string;
  userId?: string;
  sessionId?: string;
  reason?: string;
  expiresAt: Date;
  createdAt: Date;
}

interface UserPayLoad{
    id: string;
  email: string;
}


interface AccessTokenPayLoad{
  id: string;
  email: string;
  jti: string;
  sessionId?: string;
  type:"access"
}

interface RefreshTokenPayLoad{
  id:string;
  email:string;
  sessionId?: string
}

interface LoginPayLoad{
  email: string,
  password:string
}

