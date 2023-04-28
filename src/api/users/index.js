import mongoose from "mongoose";
import express from "express";
import listEndpoints from "express-list-endpoints";
import q2m from "query-to-mongo";
import UsersModel from "./model.js";
import { JWTAuthMiddleware } from "../../lib/jwtAuth.js";
import { createAccessToken } from "../../lib/tools.js";
import createHttpError from "http-errors";
import multer from "multer";
import checkCredentials from "./model.js"
import path from "path";

const usersRouter = express.Router();

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
}).single("picture");

// const upload = multer({ dest: "uploads/" });

usersRouter.get("/", async (req, res, next) => {
  try {
    const users = await UsersModel.find();
    if (users) {
      res.send(users);
    } else {
      next(createHttpError(404, `users not found`));
    }
  } catch (error) {
    next(error);
  }
});

usersRouter.get("/me", JWTAuthMiddleware, async (req, res, next) => {
try {
  const user = await UsersModel.findById(req.user._id);
  if (!user) {
    return next(createHttpError(404, "User not found"));
  }
  res.send(user);
} catch (error) {
  next(error);
}
});

usersRouter.post("/register", async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const emailAlreadyRegistered = await UsersModel.findOne({ email: email });
      if (emailAlreadyRegistered) {
        return next(
          createHttpError(400, `User with provided email already exists`)
        );
      }
      const newUser = new UsersModel(req.body);
      await newUser.save();
      if (
        (newUser && email && password) ||
        (newUser && email && password && avatar)
      ) {
        const payload = {
          _id: newUser._id,
          terminalCode: newUser.terminalCode,
        };
  
        const accessToken = await createAccessToken(payload);
        res.status(201).send({ user: newUser, accessToken: accessToken });
      }
    } catch (error) {
      next(error);
    }
  });

  usersRouter.post("/login", async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const user = await UsersModel.checkCredentials(email, password);
      if (user) {
        const payload = {
          _id: user._id,
          terminalCode: user.terminalCode,
        };
        const accessToken = await createAccessToken(payload);
        res.send({ user, accessToken });
      } else {
        next(createHttpError(401, "Credentials are not OK!"));
      }
    } catch (error) {
      next(error);
    }
  });

  usersRouter.delete("/logout", JWTAuthMiddleware, async (req, res, next) => {
    try {
    //   console.log("This is the req.user when we access the try block", req.user)
      if (req.user) {
        // console.log("This is the req.user inside the if statement", req.user)
        const user = await UsersModel.findOneAndUpdate(
          { _id: req.user._id },
          { $unset: { accessToken: 1 } },
          { new: true, runValidators: true }
        )
        if (user.isModified) {
          res.status(200).send({ message: "User logged out" })
        } else {
          res.status(400).send({ message: "User not found" })
        }
      }
    } catch (error) {
      next(error)
    }
  })

export default usersRouter;