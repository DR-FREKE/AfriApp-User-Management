import "babel-polyfill";
import BaseController from "../BaseController";
import AuthSchema from "../../model/Auth.model";

class UserController extends BaseController {
  constructor() {
    super();
  }

  processData = (data) => {
    const user = data.local;
    return {
      id: data._id,
      username: user.username,
      firstname: user.firstname,
      lastname: user.lastname,
      verified: user.verified,
    };
  };

  getAllUsers = async (req, res) => {
    try {
      const page = Math.max(0, parseInt(req.query.page) || 0);
      const limit = parseInt(req.query.limit) || 15;

      const all_user = await AuthSchema.find()
        .limit(limit)
        .skip(limit * page)
        .sort({ username: "asc" })
        .exec();

      if (all_user) {
        const users = all_user.map(this.processData);
        this._responseSuccess(res, users, "user retrieved successfully");
      }
    } catch (error) {
      this._responseError(res, error.message);
    }
  };
}

export default UserController;
