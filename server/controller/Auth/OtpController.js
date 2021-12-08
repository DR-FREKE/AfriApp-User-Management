import "babel-polyfill";
import BaseController from "../BaseController";
import otpGen from "otp-generator";
import redisClient, { client } from "../../config/redis.config";
import {
  otpValidator,
  phoneValidator,
} from "../../config/Validator/auth.validator";
import AuthSchema from "../../model/Auth.model";

class OtpController extends BaseController {
  constructor() {
    super();
  }

  sendOTP = async (res, phone) => {
    this.generateOTP(phone); //generate the otp

    // send otp using twilio to registered users
    const otp_data = await this.getOtp();
    this.sendMessage(res, otp_data);
  };

  // method to resend otp to users
  resendOTP = async (req, res) => {
    try {
      const data = req.body;

      const { error } = phoneValidator(data);

      if (error) throw new Error(error.details[0].message);

      const { phone } = data;

      this.generateOTP(phone);

      // resend sms using twilio
      const otp_data = await this.getOtp();
      if (this.sendMessage(res, otp_data))
        this._responseSuccess(res, { phone }, "otp was sent");
    } catch (error) {
      this._responseError(res, error.message);
    }
  };

  // method to send message using twilio
  sendMessage = async (res, data) => {
    /** twilio messaging bus should be used here */
    return true;
  };

  getOtp = async () => {
    let cached_data = null;

    try {
      const is_available = await client.exists("otp");

      if (is_available == 1) {
        const otp_info = await client.get("otp");
        console.log("otp is ", otp_info);

        cached_data = JSON.parse(otp_info);
      }
    } catch (error) {
      console.log(error);
    }
    return cached_data;
  };

  // method to generate otp and store it in redis
  generateOTP = async (phone) => {
    // generate otp using the otp-generator
    const otp = otpGen.generate(4, {
      alphabets: false,
      upperCase: false,
      specialChars: false,
    });

    try {
      // store otp in redis
      const data = JSON.stringify({ phone, otp: "0000" });
      const set_otp = await client.set("otp", data);
      if (set_otp) await client.expire("otp", 300);
    } catch (error) {}
  };

  /** when user validate otp, redirect to where they can setup pin */
  verifyOTP = async (req, res) => {
    const req_data = req.body;
    const { error } = otpValidator(req_data);

    if (error) this._responseError(res, error.details[0].message);

    const { otp_token, phone } = req_data;
    try {
      const check_otp = await this.checkOTP(otp_token, phone);

      if (check_otp == true) {
        const otp_data = await this.getOtp();
        const updateStatus = { "local.verified": true };
        const get_user = await AuthSchema.findOneAndUpdate(
          {
            "local.phone": otp_data.phone,
          },
          updateStatus,
          { new: true }
        );
        const { username, phone } = get_user.local;
        this._responseSuccess(res, { username, phone }, "otp verified");
      } else {
        throw new Error(check_otp);
      }
    } catch (error) {
      this._responseError(res, error.message);
    }
  };

  checkOTP = async (otp_token, phone) => {
    let result = null;
    try {
      const otp_info = await client.get("otp");
      const pkg = JSON.parse(otp_info);

      if (pkg === null) {
        result = "token either expired or does not exist";
      } else {
        if (pkg.otp !== otp_token || pkg.phone !== phone) {
          result = "otp token or phone number does not match!";
        } else {
          result = true;
        }
      }
    } catch (error) {}

    return result;
  };
}

export default OtpController;
