import "babel-polyfill";
import {
  phoneValidator,
  validateNewPassword,
} from "../../config/Validator/auth.validator";
import BaseController from "../BaseController";
import OtpController from "./OtpController";
import AuthSchema from "../../model/Auth.model";
import bcrypt from "bcryptjs";

class ForgotPasswordController extends BaseController {
  constructor() {
    super();
  }

  validatePhone = async (req, res) => {
    const data = req.body;

    try {
      const { error } = phoneValidator(data);

      if (error) throw new Error(error.details[0].message);

      // check if phone exist in db
      const user_exist = await AuthSchema.findOne({
        "local.phone": data.phone,
      });

      if (!user_exist) {
        throw new Error("user does not exist");
      }

      if (user_exist.local.verified == false) {
        throw new Error("user unverified");
      } else {
        if (user_exist) {
          const otp = new OtpController();
          if (otp.sendOTP(res, data.phone))
            this._responseSuccess(res, null, "otp was sent", "verify otp");
        }
      }
    } catch (error) {
      this._responseError(res, error.message);
    }
  };

  createNewPassword = async (req, res) => {
    const data = req.body;

    try {
      const { error } = validateNewPassword(data);

      if (error) throw new Error(error.details[0].message);

      //verify the token sent to user phone
      const otp = new OtpController();
      const is_otp = await otp.checkOTP(data.otp_token, data.phone);
      if (is_otp == true) {
        // get the phone number from store in redis
        const user_phone = await otp.getOtp();

        const { new_password } = data;
        const salted_password = await bcrypt.genSalt(10);
        const hashed_password = await bcrypt.hash(
          new_password,
          salted_password
        ); //hash new password

        //the updated data to update
        const runUpdate = { "local.password": hashed_password };

        //find user with phone number and update password
        const user = await AuthSchema.findOneAndUpdate(
          {
            "local.phone": user_phone.phone,
          },
          runUpdate,
          { new: true }
        );
        const { username, phone } = user.local;
        this._responseSuccess(res, { username, phone }, "update success");
      } else {
        throw new Error(is_otp);
      }
    } catch (error) {
      this._responseError(res, error.message);
    }
  };
}

export default ForgotPasswordController;
