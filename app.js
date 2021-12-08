import "babel-polyfill";
import express from "express";
import { Server } from "http";
import dotenv from "dotenv";

//initialize app here
const app = express();
const http = Server(app);
const PORT = process.env.PORT || 5000;
dotenv.config();

app.use(express.urlencoded({ extended: true })); //for application/x-www-form-urlencoded
app.use(express.json()); //for application/json

app.get("/", () => console.log("see you soon"));

const server = http.listen(PORT, () => {
  console.log(`app started on port ${server.address().port}`);
});
