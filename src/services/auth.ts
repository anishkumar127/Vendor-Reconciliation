import jwt from "jsonwebtoken";
const secret: any = process.env.JWT_SECRET_KEY;
export function setUser(user: any) {
  try {
    const payload = {
      _id: user._id,
      email: user.email,
      role:user.role
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
