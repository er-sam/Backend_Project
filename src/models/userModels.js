import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const UserSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
      lowerCase: true,
      trim: true,
      index: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      lowerCase: true,
      trim: true,
      unique: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    avatar: {
      type: String,
      required: true,
    },
    coverImage: {
      type: String,
    },
    watchHistory: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Video",
      },
    ],
    password: {
      type: String,
      required: [true, "password is required"],
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

// SAVING & MODIFIED PASSWORD
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return null;
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// VALIDATING PASSWORD
UserSchema.methods.validatePassword = async function (password) {
  console.log("validaton.......")
  return await bcrypt.compare(password, this.password);
};

//Access Token Generating
UserSchema.methods.accessTokenGen = function () {
 return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      fullName: this.fullName,
      userName: this.userName,
      avatar: this.avatar,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

//Refresh Token Generating
UserSchema.methods.refreshTokenGen = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const User = mongoose.model("User", UserSchema);
