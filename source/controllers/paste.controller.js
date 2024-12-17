import { asyncHandeler } from "../utils/asyncHandeler.js";
import { User } from "../modules/User.module.js";
import { Paste } from "../modules/Paste.module.js";
import { ApiResponse } from "../utils/ApiResponse.js";
const createPaste = asyncHandeler(async (req, res) => {
  const { title, content } = req.body;
  const user = await User.findById(req.user?._id).select(
    "-password -refreshToken"
  );
  if ([title, content].some((f) => f.trim() === "")) {
    return res.status(404).json(new ApiResponse(404, {}, "All fields require"));
  }
  const paste = await Paste.create({
    title,
    content,
    creator: user._id,
  });
  if (!paste) {
    return res
      .status(400)
      .json(new ApiResponse(400, {}, "Error while paste creation"));
  }
  user.pastes.push(paste._id);
  await user.save({validateBeforeSave:false})
  return res.status(200).json(new ApiResponse(200, paste, "Paste Created"));
});
const getPaste = asyncHandeler(async (req, res) => {
  const { pasteId } = req.params;
  const paste = await Paste.findById(pasteId);
  if (!paste) {
    return res.status(404).json(new ApiResponse(400, {}, "Paste not found."));
  }
  return res.status(200).json(new ApiResponse(200, paste, "Paste fetched."));
});

const getUserAllPastes = asyncHandeler(async (req, res) => {
 
  const user = await User.findById(req.user._id).populate("pastes");
  let pastes = [];
  if (user?.pastes?.length > 0) {
    pastes = user.pastes;
  }
  
  return res
    .status(200)
    .json(new ApiResponse(200, pastes, "user all pastes are fetched"));
});

const updatePaste = asyncHandeler(async (req, res) => {
  const { title, content } = req.body;
  const { pasteId } = req.params;
  const paste = await Paste.findById(pasteId);
  if (!paste) {
    return res.status(404).json(new ApiResponse(400, {}, "Paste not found."));
  }
  if (title.trim() === "") {
    return res.status(404).json(404, {}, "Paste can't update without title.");
  }
  if (title.trim() !== "") {
    if (paste.title !== title) paste.title = title;
  }
  if (content.trim() !== "") {
    if (paste.content !== content) paste.content = content;
  }
  await paste.save({ validationBeforeSave: false });

  return res.status(200).json(new ApiResponse(200, paste, "Paste updated"));
});

const removePaste = asyncHandeler(async (req, res) => {
  const { pasteId } = req.params;

  await User.findByIdAndUpdate(
    req.user._id,
    {
      $pull: { pastes: pasteId },
    },
    {
      new: true,
    }
  );
  const paste = await Paste.findByIdAndDelete(pasteId);
  if (!paste) {
    return res.status(404).json(new ApiResponse(400, {}, "Paste not found."));
  }
  return res.status(200).json(new ApiResponse(200, {}, "Paste deleted."));
});

const searchPaste = asyncHandeler(async (req, res) => {
  const { query } = req.query;

  const searchOption = {
    creator: req.user?._id,
    title: { $regex: query, $options: "i" }
  };

  const pastes = await Paste.find(searchOption);

  return res
    .status(200)
    .json(new ApiResponse(200, pastes || [], "Search result fetched"));
});

export {
  createPaste,
  getUserAllPastes,
  getPaste,
  updatePaste,
  removePaste,
  searchPaste,
};
