import mongoose, { Schema, model } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"
const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      index: true,
      trim: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, "Password required."],
    },
    refreshToken: {
      type: String,
    },
    avatar: {
      type: String,
    },
    pastes: [
      {
        type: Schema.Types.ObjectId,
        ref: "Paste",
      },
    ],
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  }
});

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password,this.password);
}

userSchema.methods.generateAccessToken = async function() {
    return await jwt.sign(
        {
            _id: this.id,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = async function(){
    return await jwt.sign(
        {
            _id : this.id,
            username : this.username
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn : process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = model("User", userSchema);
