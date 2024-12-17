import mongoose, { Schema, model } from "mongoose";

const pasteSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    creator : {
        type : Schema.Types.ObjectId,
        ref : "User"
    }
  },
  {
    timestamps: true,
  }
);

export const Paste = model("Paste", pasteSchema);
