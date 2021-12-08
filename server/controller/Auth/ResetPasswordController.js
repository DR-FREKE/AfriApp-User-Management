import "babel-polyfill";
import BaseController from "../BaseController";
import { passwordResetValidator } from "../../config/Validator/auth.validator";
import AuthSchema from "../../model/Auth.model";
import bcrypt from "bcryptjs";

class ResetPasswordController extends BaseController {
  constructor() {
    super();
  }

  updatePassword = async (req, res) => {
    const data = req.body;

    try {
      const { error } = passwordResetValidator(data);

      if (error) throw new Error(error.details[0].message);

      // find phone number and compare password
      const user = await AuthSchema.findOne({
        "local.phone": data.phone,
      });

      const valid_password = await bcrypt.compare(
        data.old_password,
        user.local.password
      );
      if (!valid_password) {
        throw new Error("mismatched password with previous password");
      }
      //hash the password before adding to database
      const { new_password } = data;
      const salted_password = await bcrypt.genSalt(10);
      const hashed_password = await bcrypt.hash(new_password, salted_password);

      const runUpdate = { "local.password": hashed_password };

      const update_pass = await AuthSchema.findOneAndUpdate(
        {
          "local.phone": data.phone,
        },
        runUpdate,
        { new: true }
      );

      const { username, phone } = update_pass.local;
      this._responseSuccess(
        res,
        { username, phone },
        "password updated successfully"
      );
    } catch (error) {
      this._responseError(res, error.message);
    }
  };
}

export default ResetPasswordController;
