import { Router } from "express";
import { authentication } from "../middelwares/authentication.middelware.js";
import {
  createPaste,
  getPaste,
  getUserAllPastes,
  removePaste,
  searchPaste,
  updatePaste,
} from "../controllers/paste.controller.js";

const route = Router();
route.route("/all-pastes").get(authentication, getUserAllPastes);
route.route("/").post(authentication, createPaste);
route.route("/:pasteId").delete(authentication, removePaste);
route.route("/:pasteId").patch(authentication, updatePaste);
route.route("/search").get(authentication, searchPaste);
route.route("/:pasteId").get(authentication, getPaste);

export { route as pastesRoute };
