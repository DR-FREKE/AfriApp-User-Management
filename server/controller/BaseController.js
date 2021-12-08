import "babel-polyfill";

/**
 * this is an Interface that has the response methods and every class
 * implementing this interface must implement the methods
 */

class BaseController {
  constructor(req, res) {
    this.req = req;
    this.res = res;
  }

  /** handle response errors */
  _responseError = (res, error, next_step = null) => {
    return res
      .status(400)
      .json({ message: error, data: null, success: false, next_step });
  };

  _responseSuccess = (
    res,
    data = null,
    msg = "successful",
    next_step = null
  ) => {
    return res
      .status(200)
      .json({ message: msg, data, success: true, next_step });
  };
}

export default BaseController;
