import { Request, Response } from "express";
import { User } from "../../models/user.model";
import { setUser } from "../../services/auth";

export const userSignUpController = async (req: Request, res: Response) => {
  try {
    const { username, email, fullname, password } = req.body;
    if (!username || !email || !fullname || !password)
      return res.status(404).json({ error: "Please provied all fields!" });
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "Username or email already exists" });
    }

    // Create a new user
    try {
      await User.create({
        username,
        email,
        fullname,
        password,
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

// Login

export const userSignInController = async (req: Request, res: Response) => {
  const { username, email, password } = req.body;
  console.log(username, email, password);
  const user = await User.findOne({ username, email, password }).select(
    "-password"
  );
  if (!user) {
    return res.status(404).json({ error: "User not found!" });
  }
  const token = setUser(user);
  // res.cookie("uid", token, { httpOnly: true }); // domain specific.
  console.log(res);
  return res.status(200).json({ token: token });
};
