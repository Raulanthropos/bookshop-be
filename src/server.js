import express from "express";
import listEndpoints from "express-list-endpoints";
import cors from "cors";
import {
  badRequestHandler,
  genericServerErrorHandler,
  notFoundHandler,
  unauthorizedHandler,
} from "./errorHandlers.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
import usersRouter from "./api/users/index.js";

dotenv.config();

const server = express();
const port = process.env.PORT || 3001;

const whitelist = ["http://localhost:3000"];

const corsOpts = {
    origin: (origin, corsNext) => {
      if (!origin || whitelist.indexOf(origin) !== -1) {
        corsNext(null, true);
      } else {
        corsNext(createHttpError(400, "Current Origin is not in whitelist"));
      }
    },
  };


server.use(cors(corsOpts));
  
server.use(express.json());

server.use("/users", usersRouter);

server.use(badRequestHandler);
server.use(unauthorizedHandler);
server.use(notFoundHandler);
server.use(genericServerErrorHandler);

mongoose.connect(process.env.MONGO_URL);

mongoose.connection.on("connected", () => {
  console.log("Connected to DB");
  server.listen(port, () => {
    console.table(listEndpoints(server));
    console.log(`Server is running on port: ${port}`);
  });
});