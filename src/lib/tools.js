import jwt from "jsonwebtoken";
import UsersModel from "../api/users/model.js"

export const createAccessToken = (payload) =>
new Promise((resolve, reject) =>
    jwt.sign(
      { ...payload },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
      (err, token) => {
        if (err) reject(err);
        else resolve(token);
      }
    )
  );

  export const verifyAccessToken = (accessToken) =>
  new Promise((res, rej) =>
    jwt.verify(accessToken, process.env.JWT_SECRET, (err, originalPayload) => {
      if (err) rej(err);
      else res({ _id: originalPayload._id });
    })
  );