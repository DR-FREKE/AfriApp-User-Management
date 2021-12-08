import "babel-polyfill";
import { Router } from "express";
import authRoute from "./auth.route";
import userRoute from "./user.route";
import passport from "passport";

const app_route = Router();

const authorize = passport.authenticate("jwt", { session: false });

app_route.use("/auth", authRoute);
app_route.use("/user", authorize, userRoute);

export default app_route;
