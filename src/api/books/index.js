import mongoose from "mongoose";
import express from "express";
import listEndpoints from "express-list-endpoints";
import q2m from "query-to-mongo";
import BooksModel from "./model.js";
import { JWTAuthMiddleware } from "../../lib/jwtAuth.js";
import {adminOnlyMiddleware} from "../../lib/adminOnly.js";
import { createAccessToken } from "../../lib/tools.js";
import createHttpError from "http-errors";
import multer from "multer";
import checkCredentials from "./model.js"
import path from "path";

const booksRouter = express.Router();

// Set up multer storage
const storage = multer.diskStorage({
  destination: "./public/images",
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
  },
});

// Set up multer upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 100000000 },
}).single("cover");

// const upload = multer({ dest: "uploads/" });

booksRouter.get("/", async (req, res, next) => {
  try {
    const books = await BooksModel.find();
    if (books) {
      res.send(books);
    } else {
      next(createHttpError(404, `Books not found`));
    }
  } catch (error) {
    next(error);
  }
});

booksRouter.post("/", JWTAuthMiddleware, adminOnlyMiddleware, async (req, res, next) => {
  try {
    // Upload the picture file to the server
    upload(req, res, async (error) => {
      if (error instanceof multer.MulterError) {
        console.log(error.message)
        next(createHttpError(400, "Image upload error"));
      } else if (error) {
        next(createHttpError(400, error.message));
      } else {
        // Construct the book object with the form data and picture path
        const newBook = {
          title: req.body.title,
          author: req.body.author,
          pages: req.body.pages,
          cover: req.file.filename,
        };

        // Create the new book object
        const createdBook = await BooksModel.create(newBook);

        // Respond with the created book object
        res.status(201).send(createdBook);
      }
    });
  } catch (error) {
    next(error);
  }
});

booksRouter.delete("/:id", JWTAuthMiddleware, adminOnlyMiddleware, async (req, res, next) => {
  try {
    const book = await BooksModel.findById(req.params.id);
    if (book) {
      await BooksModel.findByIdAndDelete(req.params.id);
      res.status(204).send();
    } else {
      next(createHttpError(404, `Book with ID ${req.params.id} not found`));
    }
  } catch (error) {
    next(error);
  }
});

booksRouter.put("/:id", JWTAuthMiddleware, adminOnlyMiddleware, async (req, res, next) => {
  try {
    const book = await BooksModel.findByIdAndUpdate(
      req.params.id,
      {
        title: req.body.title,
        author: req.body.author,
        pages: req.body.pages,
      },
      { new: true }
    );
    if (book) {
      res.send(book);
    } else {
      next(createHttpError(404, `Book with ID ${req.params.id} not found`));
    }
  } catch (error) {
    next(error);
  }
});


export default booksRouter;