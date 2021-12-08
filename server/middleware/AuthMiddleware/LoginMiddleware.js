import "babel-polyfill";
import passport from "passport";
import bcrypt from "bcryptjs";
import { Strategy } from "passport-local";
import AuthSchema from "../../model/Auth.model";

class LoginMiddleware {
  constructor() {}

  loginStrategy = async () => {
    const localPassport = passport.use(
      "signin-local",
      new Strategy(
        {
          usernameField: "phone",
          passwordField: "phone",
          passReqToCallback: true,
        },
        this.localStrategyCallback
      )
    );

    return localPassport;
  };

  localStrategyCallback = async (req, phone, password, done) => {
    try {
      //check if user exist in DB
      const user = await AuthSchema.findOne({ "local.phone": phone });

      if (!user) {
        req.auth_error = "phone number or password is invalid";
        return done(null, false);
      }

      //compare the password
      // const valid_password = await bcrypt.compare(
      //   password,
      //   user.local.password
      // );
      // if (!valid_password) {
      //   req.auth_error = "wrong password provided";
      //   return done(null, false);
      // }

      if (user.local.verified === false) {
        req.auth_error = "user unverified";
        return done(null, user);
      } else {
        return done(null, user);
      }
    } catch (error) {
      console.error(error);
      done(error);
    }
  };
}

export default LoginMiddleware;
