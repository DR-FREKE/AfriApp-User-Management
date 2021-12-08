import "babel-polyfill";
import { Router } from "express";
import UserController from "../controller/User/UserController";

const users = new UserController();

const route = Router();

route.get("/", users.getAllUsers);

export default route;
