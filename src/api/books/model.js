import mongoose from "mongoose";

const { Schema, model } = mongoose;

const bookSchema = new Schema(
  {
    title: { type: String, required: true },
    author: { type: String, required: true },
    pages: { type: Number },
    cover: { type: String },
    price: { type: Number, required: true, default: 10},
  },
  { timestamps: true }
);

export default model("Book", bookSchema);