import "babel-polyfill";
import passport from "passport";
import bcrypt from "bcryptjs";
import { Strategy } from "passport-local";
import AuthSchema from "../../model/Auth.model";

class RegisterMiddleware {
  constructor() {}

  signUpStrategy = async () => {
    const localPassport = passport.use(
      "signup-local",
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
      // check if user already exist
      const user_exist = await AuthSchema.findOne({
        "local.phone": phone,
      });

      if (user_exist && user_exist.local.verified === false) {
        req.auth_error = "user unverified";
        return done(null, user_exist);
      }

      if (user_exist) {
        req.auth_error = "this user already exist";
        return done(null, false);
      }

      //hash the password before adding to database
      // const salted_password = await bcrypt.genSalt(10);
      // const hashed_password = await bcrypt.hash(password, salted_password);

      const user_data = {
        local: {
          username: req.body.username,
          phone,
          // password: hashed_password,
        },
      };

      return done(null, user_data);
    } catch (error) {
      console.error(error);
      done(error);
    }
  };
}

export default RegisterMiddleware;
