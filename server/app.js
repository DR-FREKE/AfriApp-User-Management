import "babel-polyfill";
import express from "express";
import { Server } from "http";
import mongoose from "mongoose";
import passport from "passport";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";
import swaggerUI from "swagger-ui-express";
import swaggerDoc from "../swagger.json";
import connection from "./database/connection";
import redisConnection from "./config/redis.config";
import routers from "./routes";
import RegisterMiddleware from "./middleware/AuthMiddleware/RegisterMiddleware";
import LoginMiddleware from "./middleware/AuthMiddleware/LoginMiddleware";
import Authorization from "./middleware/Authorization";

//initialize app here
const app = express();
const http = Server(app);
const PORT = process.env.PORT || 5000;
dotenv.config();

//call passport middleware here
new RegisterMiddleware().signUpStrategy();
new LoginMiddleware().loginStrategy();
new Authorization().verifyHeaderToken();

/** call connection from database and redis here */
connection();
redisConnection;

/** set app middleware */
app.use(cors());
app.use(express.urlencoded({ extended: true })); //for application/x-www-form-urlencoded
app.use(express.json()); //for application/json

// log request
app.use(morgan("combined"));
app.use(passport.initialize());

// set route middleware
app.use("/api/v1", routers);
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDoc));
app.all("/*", (req, res) => res.json({ message: "endpoint does not exist" }));

const server = http.listen(PORT, () => {
  console.log(`app started on port ${server.address().port}`);
});
