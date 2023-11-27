import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unqiue: true,
      lowecase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unqiue: true,
      lowecase: true,
      trim: true,
      index: true,
    },
    fullname: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    role: {
      type: [
        {
          type: String,
          enum: ["USER", "ADMIN", "MASTER", "GUEST"],
        },
      ],
      required: true,
      default: "USER",
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

export const User = mongoose.model("User", userSchema);
