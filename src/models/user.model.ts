import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
dotenv.config();
const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    adminId: {
      type: mongoose.Types.ObjectId,
      default: null,
    },
    role: {
      type: String,
      enum: ["USER", "ADMIN", "MASTER", "GUEST"],
      default: "USER",
      required: true,
    },
    avatar: {
      type: String, // cloudinary url.
      // required :true ,
    },
    coverImage: {
      type: String,
    },
    // lastHistory: [
    //   {
    //     type: Schema.Types.ObjectId,
    //     ref: "SOA",
    //   },
    // ],
    password: {
      type: String,
      required: [true, "Password is required."],
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

// middlewares - hooks

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// methods - check is password correct or not!. -> custom methods.
userSchema.methods.isPasswordCorrect = async function (
  password: string
): Promise<boolean> {
  console.log(this);
  return await bcrypt.compare(password, await this.password);
};

// static
userSchema.static("matchPassword", async function (email, password) {
  const user = await this.findOne({ email });
  if (!user) throw new Error("User not found!");
  const isMatched = await bcrypt.compare(password, user.password);

  if (!isMatched) throw new Error("Password is wrong!");
  return { ...user, password: undefined };
});

// methods - token & refresh token
userSchema.methods.generateAccessToken = async function () {
  const secret = process.env.ACCESS_TOKEN_SECRET;
  if (!secret) throw new Error("Access token secret is not defined.");
  return await jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullName: this.fullName,
    },
    secret,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRE,
    }
  );
};

userSchema.methods.generateRefreshToken = async function () {
  const secret = process.env.REFERSH_TOKEN_SECRET;
  if (!secret) throw new Error("Access token secret is not defined.");
  return await jwt.sign(
    {
      _id: this._id,
    },
    secret,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRE,
    }
  );
};
export const User = mongoose.model("User", userSchema);
