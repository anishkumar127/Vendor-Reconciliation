import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
const secret: any = process.env.ACCESS_TOKEN_SECRET;
export function setUser(user: any) {
  try {
    const payload = {
      _id: user._id,
      email: user.email,
      username: user.username,
      role: user.role,
    };
    return jwt.sign(payload, secret);
  } catch (error) {
    return null;
  }
}

export function getUser(token: any) {
  if (!token) return null;
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    return null;
  }
}
