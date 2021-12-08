import "babel-polyfill";
import { client } from "../../config/redis.config";
import BaseController from "../BaseController";
import jwt from "jsonwebtoken";
import {
  pinCreateValidator,
  pinValidator,
  pinResetValidator,
  pinReValidator,
} from "../../config/Validator/auth.validator";
import AuthSchema from "../../model/Auth.model";

class PinController extends BaseController {
  constructor() {
    super();
  }

  // method to validate pin provide by user to that in the DB
  validatePin = async (req, res) => {
    try {
      const data = req.body;
      const { error } = pinValidator(data);

      if (error) throw new Error(error.details[0].message);

      // check redis store for user and get if any
      const is_user_cred = await client.exists("user_cred");
      if (is_user_cred == 0) throw new Error("session expired");

      if (is_user_cred == 1) {
        const user_cred = await client.get("user_cred");
        const cached_data = JSON.parse(user_cred);

        const user_pin = await AuthSchema.findOne({
          "local.phone": cached_data.phone,
          "local.pin": data.pin,
        });

        if (!user_pin) throw new Error("invalid pin");

        delete cached_data.password;

        const token = jwt.sign(
          { user: { cached_data } },
          process.env.SECRET_KEY,
          {
            expiresIn: "600s",
          }
        );

        cached_data.username = user_pin.local.username;
        const user_data = cached_data;

        this._responseSuccess(res, { user_data, token }, "pin validated");
      }
    } catch (error) {
      this._responseError(res, error.message);
    }
  };

  // method to create pin
  createPin = async (req, res) => {
    try {
      const data = req.body;
      const { error } = pinCreateValidator(data);

      if (error) throw new Error(error.details[0].message);

      // check if otp is still available otherwise terminate session
      //   const is_otp = await client.exists("otp");

      //   if (is_otp == 0) throw new Error("session expired");

      if (data.pin !== data.confirm_pin) throw new Error("pin does not match");

      const updatePin = { "local.pin": data.pin };

      const find_user = await AuthSchema.findOneAndUpdate(
        {
          "local.phone": data.phone,
          "local.pin": null,
        },
        updatePin,
        { new: true }
      );

      if (!find_user)
        throw new Error(
          "user already own a pin, try reseting your pin instead"
        );
      const { username, phone } = find_user.local;
      this._responseSuccess(
        res,
        { username, phone },
        "pin created",
        "redirect to dashboard"
      );
    } catch (error) {
      this._responseError(res, error.message);
    }
  };

  // method to reset user pin
  resetUserPin = async (req, res) => {
    try {
      const data = req.body;
      const { error } = pinResetValidator(data);

      if (error) throw new Error(error.details[0].message);

      if (data.new_pin !== data.confirm_new_pin)
        throw new Error("pin does not match");

      const updatePin = { "local.pin": data.new_pin };

      const find_user = await AuthSchema.findOneAndUpdate(
        {
          "local.phone": data.phone,
        },
        updatePin,
        { new: true }
      );

      if (!find_user) throw new Error("old_pin or phone number don't match");
      const { username, phone } = find_user.local;
      this._responseSuccess(res, { username, phone }, "reset successful");
    } catch (error) {
      this._responseError(res, error.message);
    }
  };

  revalidatePin = async (req, res) => {
    try {
      const data = req.body;
      const { error } = pinReValidator(data);

      if (error) throw new Error(error.details[0].message);

      const user_pin = await AuthSchema.findOne({
        "local.phone": data.phone,
        "local.pin": data.pin,
      });

      if (!user_pin) throw new Error("invalid pin");

      const token = jwt.sign({ user: data.phone }, process.env.SECRET_KEY, {
        expiresIn: "600s",
      });
      const { username, phone } = user_pin.local;
      const { _id } = user_pin;
      const user_data = { username, phone, _id };
      this._responseSuccess(res, { user_data, token }, "pin validated");
    } catch (error) {
      this._responseError(res, error.message);
    }
  };
}

export default PinController;
