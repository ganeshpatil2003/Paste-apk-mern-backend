import { asyncHandeler } from "../utils/asyncHandeler.js";
import { User } from "../modules/User.module.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/uploadOnCloudinary.js";

const options = {
  httpOnly: true,
  secure: true,
};
const generateAccessAndRefreshTokens = async (id) => {
  const user = await User.findById(id);

  const accessToken = await user.generateAccessToken();
  const refreshToken = await user.generateRefreshToken();
  // console.log(accessToken)
  user.refreshToken = refreshToken;

  await user.save({ validateBeforeSave: false });
  return { refreshToken, accessToken };
};
const registerUser = asyncHandeler(async (req, res) => {
  const { username, email, password } = req.body;
  // console.log(req.body)
  if ([username, email, password].some((field) => field.trim() === "")) {
    return res
      .status(404)
      .json(new ApiResponse(404, {}, "All fields are required"));
  }
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    return res
      .status(400)
      .json(
        new ApiResponse(400, {}, "User with username or email already exist.")
      );
  }

  const user = await User.create({
    username,
    email,
    password,
  })
  // console.log(user)
  const createdUser = await User.findById(user._id).select("-password -refreshToken");
  if (!user) {
    return res
      .status(400)
      .json(new ApiError(400, {}, "Error while user creation"));
  }
  // console.log('created user',createdUser)
  return res
    .status(200)
    .json(new ApiResponse(200, createdUser, `${username} Signed up.`));
});

const logInUser = asyncHandeler(async (req, res) => {
  const { email, password } = req.body;
  if ([email, password].some((f) => f.trim() === "")) {
    return res
      .status(404)
      .json(new ApiResponse(404, {}, "All fields are required"));
  }
  const user = await User.findOne({
    email,
  });

  if (!user) {
    return res.status(404, {}, "User doesn't exist.");
  }

  const checkPassword = await user.isPasswordCorrect(password);

  if (!checkPassword) {
    return res
      .status(400)
      .json(new ApiResponse(400, {}, "Password incorrect."));
  }

  const { refreshToken, accessToken } = await generateAccessAndRefreshTokens(
    user._id
  );
  // console.log('refreshToken',refreshToken,'\n','accessToken',accessToken)
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        `Welcome ${loggedInUser.username}`
      )
    );
});

const logOutUser = asyncHandeler(async (req, res) => {
  const userId = req.userId;
  await User.findByIdAndUpdate(
    userId,
    {
      $unset: { refreshToken: 1 },
    },
    {
      new: true,
    }
  );

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "Logged out."));
});

const changePassword = asyncHandeler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id);
  if ([oldPassword, newPassword].some((f) => f.trim() === "")) {
    return res
      .status(400)
      .json(new ApiResponse(400, {}, "All fields are required."));
  }

  const checkPassword = await user.isPasswordCorrect(oldPassword);

  if (!checkPassword) {
    return res
      .status(400)
      .json(new ApiResponse(400, {}, "Old password incorrect"));
  }

  user.password = newPassword;

  await user.save({ validationBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully."));
});

const getUser = asyncHandeler(async (req, res) => {
  const user = req.user;

  const currentUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  return res
    .status(200)
    .json(new ApiResponse(200, currentUser, "User fetched successfully."));
});

const changeAvatar = asyncHandeler(async (req, res) => {
  const avatarLocalePath = req.file?.path;
  const user = await User.findById(req.user?._id).select("-password -refreshToken");
  // console.log(req.file)
  if (!avatarLocalePath) {
    return res
      .status(400)
      .json(new ApiResponse(400, {}, "Error while uploading photo"));
  }
  const response = await uploadOnCloudinary(avatarLocalePath);

  if (!response?.url) {
    return res.status(400).json(400, {}, "Failed to upload image.");
  }

  if (user?.avatar) {
    await deleteFromCloudinary(user.avatar);
  }

  user.avatar = response.url;

  await user.save({ validationBeforeSave: false });

  return res.status(200).json(new ApiResponse(200, {}, "Image updated."));
});

const updateUser = asyncHandeler(async (req, res) => {
  const { username, email } = req.body;
  // console.log(username,email)
  const user = await User.findById(req.user._id).select("-password -refreshToken");
  if ((username.trim() === "") ) {
    return res
      .status(400)
      .json(new ApiResponse(400, {}, "Atleast one field require"));
  }
  if (username.trim() !== "") {
    user.username = username;
  }
  await user.save({ validationBeforeSave: false });
  // console.log(user)
  return res.status(200).json(new ApiResponse(200, user, "Details updated."));
});

export {
  registerUser,
    logInUser,
    logOutUser,
    changePassword,
    getUser,
    changeAvatar,
    updateUser
}
