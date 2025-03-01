import mongoose from "mongoose";

const urlSchema = new mongoose.Schema(
  {
    shortURL: {
      type: String,
      required: true,
      unique: true,
    },

    originalURL: {
      type: String,
      required: true,
    },

    visitHistory: [
      {
        timestamp: { type: Number },
      },
    ],
  },
  { timestamp: true }
);



const URL = mongoose.model("url", urlSchema);

export default URL;
