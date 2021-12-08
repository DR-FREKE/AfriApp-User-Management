import "babel-polyfill";
import { Router } from "express";
import ForgotPasswordController from "../controller/Auth/ForgotPasswordController";
import LoginController from "../controller/Auth/LoginController";
import OtpController from "../controller/Auth/OtpController";
import PinController from "../controller/Auth/PinController";
import RegisterController from "../controller/Auth/RegisterController";
import ResetPasswordController from "../controller/Auth/ResetPasswordController";
import passport from "passport";

const register = new RegisterController();
const token = new OtpController();
const login = new LoginController();
const reset = new ResetPasswordController();
const forgot = new ForgotPasswordController();
const pin = new PinController();

const route = Router();

const authorize = passport.authenticate("jwt", { session: false });

route.post("/login", login.loginUser);
route.post("/register", register.store);
route.post("/verify-otp", token.verifyOTP);
route.post("/resend-otp", token.resendOTP);
route.post("/reset-password", authorize, reset.updatePassword); // only when a user is logged in
route.post("/validate-phone", forgot.validatePhone);
route.post("/create/new-password", forgot.createNewPassword);
route.post("/create-pin", pin.createPin);
route.post("/validate-pin", pin.validatePin);
route.post("/re-validate-pin", pin.revalidatePin);
route.post("/reset-pin", authorize, pin.resetUserPin);

export default route;
