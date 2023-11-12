import { Request, Response } from "express";
import { User } from "../../models/user.model";

export const userSignUpController = async (req: Request, res: Response) => {
  try {
    const { username, email, fullname, password } = req.body;
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "Username or email already exists" });
    }

    // Create a new user
    const newUser = new User({
      username,
      email,
      fullname,
      password,
    });

    await newUser.save();
    return res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
