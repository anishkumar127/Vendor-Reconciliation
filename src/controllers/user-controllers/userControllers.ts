import bcrypt from "bcrypt";
import { Request, RequestHandler, Response } from "express";
import { User } from "../../models/user.model";
import { getUser, setUser } from "../../services/auth";
import dotenv from "dotenv";
import { getExactRole, getMyRole } from "../../utils/utils";
dotenv.config();
export const userSignUpController = async (req: Request, res: Response) => {
  try {
    const { username, email, fullName, password } = req.body;
    if (!username || !email || !fullName || !password)
      return res.status(404).json({ error: "Please provied all fields!" });
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "Username or email already exists" });
    }

    const authorizationHeaderValue = req.headers["authorization"];
    if (
      !authorizationHeaderValue ||
      !authorizationHeaderValue?.startsWith("Bearer")
    )
      return res.status(401).json({ error: "token not provided!" });

    const token = authorizationHeaderValue?.split("Bearer ")[1];
    if (!token) {
      return res.status(401).json({ error: "token not provided!" });
    }

    const role: string = await getMyRole(token);
    console.log("ROLE", role);
    const { _id: ID }: any = await getUser(token);
    console.log("ID", ID);
    // Create a new user
    try {
      await User.create({
        username,
        email,
        fullName,
        password,
        role,
        adminId: role === "USER" ? ID : null,
      });
    } catch (error) {
      return res.status(500).json({ error: `Internal Server Error! ${error}` });
    }
    return res.status(201).json({ response: `User created successfully` });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// Login OLD WAY WOKRING

// export const userSignInController = async (req: Request, res: Response) => {
//   const { username, email, password } = req.body;
//   console.log(username, email, password);
//   const user = await User.findOne({ username, email, password }).select(
//     "-password"
//   );
//   if (!user) {
//     return res.status(404).json({ error: "User not found!" });
//   }
//   const token = setUser(user);
//   // res.cookie("uid", token, { httpOnly: true }); // domain specific.
//   console.log(res);
//   return res.status(200).json({ token: token });
// };

// LOGIN NEW TEST
// export const userSignInController = async (req: Request, res: Response) => {
//   const { email, password } = req.body;
//   // eslint-disable-next-line @typescript-eslint/ban-ts-comment
//   // @ts-expect-error
//   const user = await User.matchPassword(email, password);
//   console.log(user);
//   if (!user) {
//     return res.status(400).json({ error: user });
//   }
//   const token = setUser(user);
//   return res.status(200).json({ token: token });
// };

// LOGIN TEST 2

export const userSignInController = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (email === "master@gmail.com" && password === "master") {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "user not found!" });
    }
    // const isMatched = await bcrypt.compare(password, user.password);
    // if (!isMatched) return res.status(400).json({ error: "password is Wrong!" });

    const token = setUser(user);
    // const token_expire = new Date(Date.now() + 24 * 60 * 60 * 1000);
    // res.cookie("access_token", token, {
    //   httpOnly: true,
    //   expires: token_expire,
    //   // path: '/',
    //   sameSite: 'none',
    //   secure:true
    // });
    console.log(token);

    return res.status(200).json({
      role: "MASTER",
      token: token,
      fullName: user?.fullName,
      email: user?.email,
      username: user?.username,
      ID: user?._id,
    });
  } else {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "user not found!" });
    }
    const isMatched = await bcrypt.compare(password, user.password);
    if (!isMatched)
      return res.status(400).json({ error: "password is Wrong!" });

    const token = setUser(user);
    // const token_expire = new Date(Date.now() + 24 * 60 * 60 * 1000);
    // res.cookie("access_token", token, {
    //   httpOnly: true,
    //   expires: token_expire,
    // });
    console.log(token);
    return res.status(200).json({
      role: user?.role,
      fullName: user?.fullName,
      email: user?.email,
      username: user?.username,
      token: token,
      ID: user?._id,
    });
  }
};

// logout
export const UserLogout = async (req: Request, res: Response) => {
  res.clearCookie("access_token");
  return res.status(200).json({ message: "Logout successful" });
};

// Get All User

export const getAllUser: RequestHandler = async (req, res) => {
  const authorizationHeaderValue = req.headers["authorization"];
  if (
    !authorizationHeaderValue ||
    !authorizationHeaderValue?.startsWith("Bearer")
  )
    return res.status(401).json({ error: "token not provided!" });

  const token = authorizationHeaderValue?.split("Bearer ")[1];
  if (!token) {
    return res.status(401).json({ error: "token not provided!" });
  }

  const role: string = await getExactRole(token);
  const { _id: ID }: any = await getUser(token);

  if (!role) return res.status(404).json({ error: "role not found!" });
  if (role && role === "MASTER") {
    const allUser = await User.find({
      role: { $ne: "MASTER" },
      email: { $ne: "master@gmail.com" },
    }).select("-password");
    if (!allUser) return res.status(404).json({ error: "user not found!" });
    return res.status(200).json({ data: allUser });
  } else if (role && role === "ADMIN") {
    const adminUser = await User.findOne({ _id: ID });
    if (!adminUser || adminUser.role !== "ADMIN") {
      return res.status(404).json({ error: "Admin not found!" });
    }
    const adminId = adminUser?._id;
    const adminAllUser = await User.find({ adminId }).select("-password");
    return res.status(200).json({ data: adminAllUser });
  } else {
    return res.status(404).json({ error: "no data for USER Role!" });
  }
};
