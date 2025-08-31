import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { Types } from "mongoose";

export interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

const JWT_SECRET: Secret =
  process.env.JWT_SECRET || "your-super-secret-jwt-key";
const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || "7d";

export function generateToken(userId: Types.ObjectId, email: string): string {
  const payload: Omit<JWTPayload, "iat" | "exp"> = {
    userId: userId.toString(),
    email,
  };

  const options: SignOptions = {
    expiresIn: JWT_EXPIRES_IN as any, // ✅ cast ตรงนี้
  };

  return jwt.sign(payload, JWT_SECRET, options);
}

export function verifyToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
}

export function decodeToken(token: string): JWTPayload | null {
  try {
    return jwt.decode(token) as JWTPayload;
  } catch (error) {
    return null;
  }
}
