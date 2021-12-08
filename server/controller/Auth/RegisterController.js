import "babel-polyfill";
import BaseController from "../BaseController";
import { registerValidator } from "../../config/Validator/auth.validator";
import passport from "passport";
import OtpController from "./OtpController";
import axios from "axios";
import AuthSchema from "../../model/Auth.model";

class RegisterController extends BaseController {
  constructor() {
    super();
  }

  store = async (req, res, next) => {
    try {
      // validate field before creating users
      const { error } = registerValidator(req.body);

      if (error) throw new Error(error.details[0].message);

      const create_user = passport.authenticate(
        "signup-local",
        {
          failWithError: true,
        },
        async (err, user, info) => {
          try {
            if (req.auth_error == "user unverified") {
              // send otp to user
              if (new OtpController().sendOTP(res, user.local.phone))
                this._responseSuccess(res, null, "otp was sent", "verify otp");
            } else {
              if (req.auth_error) throw new Error(req.auth_error);

              const user_created = await this.createUser(user);

              if (user_created) {
                req.login(user, { session: false }, async (err) => {
                  if (err) throw new Error(err);

                  if (user) {
                    // send otp to user
                    const { username, phone } = user.local;
                    if (new OtpController().sendOTP(res, user.local.phone))
                      this._responseSuccess(
                        res,
                        { username, phone },
                        "otp was sent",
                        "verify otp"
                      );
                  }
                });
              }
            }
          } catch (error) {
            this._responseError(res, error.message);
          }
        }
      );
      return create_user(req, res, next);
    } catch (error) {
      this._responseError(res, error.message);
    }
  };

  createUser = async (data) => {
    const session = await AuthSchema.startSession();
    session.startTransaction();

    try {
      const add_user = new AuthSchema(data);
      const save_user = await add_user.save({ session });

      // await this.createAccount(save_user);

      await session.commitTransaction();

      return save_user;
    } catch (error) {
      await session.abortTransaction();
      throw new Error("User cannot register at this time");
    } finally {
      session.endSession();
    }
  };

  createAccount = async (data) => {
    const res = await axios.post("http://localhost:4005/events", { data });

    return res;
  };
}
export default RegisterController;
