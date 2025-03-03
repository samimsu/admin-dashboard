import { SignJWT, jwtVerify } from "jose";
import { JwtPayload } from "./types";

const SECRET_KEY = process.env.JWT_SECRET;
if (!SECRET_KEY) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}

// Convert SECRET_KEY to Uint8Array for jose
const secret = new TextEncoder().encode(SECRET_KEY);

export const generateToken = async (user: {
  id: number;
  email: string;
}): Promise<string> => {
  const token = await new SignJWT({ id: user.id, email: user.email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(secret);
  return token;
};

export const verifyToken = async (
  token: string
): Promise<JwtPayload | null> => {
  try {
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ["HS256"],
    });
    return payload as unknown as JwtPayload;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
};
