import { Router } from "express";
import { authentication } from "../middelwares/authentication.middelware.js";
import {upload} from "../middelwares/multer.middelware.js";
import {
  changeAvatar,
  changePassword,
  getUser,
  logInUser,
  logOutUser,
  registerUser,
  updateUser,
} from "../controllers/user.controller.js";
const route = Router();

route.route("/register").post(registerUser);

route.route("/login").post(logInUser);

route.route("/logout").post(authentication, logOutUser);

route.route("/change-password").patch(authentication, changePassword);

route
  .route("/change-avatar")
  .patch(authentication, upload.single("avatar"), changeAvatar);

route.route("/").get(authentication, getUser);

route.route("/update").patch(authentication, updateUser);

export { route as userRouter };
