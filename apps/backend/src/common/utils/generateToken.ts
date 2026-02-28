import jwt, { SignOptions } from "jsonwebtoken"

export interface TokenPayload {
  id: string
  role: string
  tokenVersion: number
}

export function generateAccessToken(payload: TokenPayload): string {
  const secret = process.env.JWT_ACCESS_SECRET
  const expiresIn = process.env.JWT_ACCESS_EXPIRES_IN || "15m"

  if (!secret) {
    throw new Error("JWT_ACCESS_SECRET no definido")
  }

  const options: SignOptions = {
    expiresIn: expiresIn as SignOptions["expiresIn"],
  }

  return jwt.sign(payload, secret, options)
}

export function generateRefreshToken(payload: TokenPayload): string {
  const secret = process.env.JWT_REFRESH_SECRET
  const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || "7d"

  if (!secret) {
    throw new Error("JWT_REFRESH_SECRET no definido")
  }

  const options: SignOptions = {
    expiresIn: expiresIn as SignOptions["expiresIn"],
  }

  return jwt.sign(payload, secret, options)
}