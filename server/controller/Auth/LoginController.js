import "babel-polyfill";
import BaseController from "../BaseController";
import { loginValidator } from "../../config/Validator/auth.validator";
import passport from "passport";
import OtpController from "./OtpController";
import { client } from "../../config/redis.config";

class LoginController extends BaseController {
  constructor() {
    super();
  }

  loginUser = async (req, res, next) => {
    try {
      const { error } = loginValidator(req.body);

      if (error) throw new Error(error.details[0].message);

      // login user with passport
      const login_user = passport.authenticate(
        "signin-local",
        {
          failWithError: true,
        },
        async (err, user, info) => {
          try {
            if (req.auth_error == "user unverified") {
              // send otp to user
              if (new OtpController().sendOTP(res, user.local.phone))
                this._responseSuccess(res, "good", "otp sent");
            } else {
              if (req.auth_error) throw new Error(req.auth_error);

              if (user.local.pin == null)
                throw new Error("please setup your pin"); // redirect user to where they can set pin

              req.login(user, { session: false }, async (err) => {
                if (err) throw new Error(err);

                const { _id } = user;
                const { phone, password, username } = user.local;
                const body = { _id, phone, password };
                this.storeUserCredentials(body);

                this._responseSuccess(
                  res,
                  { user: { username, phone } },
                  "login success",
                  "redirect to pin validation"
                );
              });
            }
          } catch (error) {
            this._responseError(res, error.message);
          }
        }
      );

      return login_user(req, res, next);
    } catch (error) {
      this._responseError(res, error.message);
    }
  };

  storeUserCredentials = async (data) => {
    try {
      const stringify_data = JSON.stringify(data);
      const setCredentials = await client.set("user_cred", stringify_data);
      if (setCredentials) await client.expire("user_cred", 600);
    } catch (error) {}
  };
}

export default LoginController;
