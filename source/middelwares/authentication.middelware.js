import { asyncHandeler } from "../utils/asyncHandeler.js";
import { User } from "../modules/User.module.js";
import jwt from "jsonwebtoken";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
const authentication = asyncHandeler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");
      
    if (!token) {
      return res.status(400).json(400, {}, "Unauthorized request.");
    }
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decodedToken._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      return res
        .status(400)
        .json(new ApiResponse(400, {}, "Invalid access token."));
    }
    req.user = user;

    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Access Token");
  }
});

export {authentication}
