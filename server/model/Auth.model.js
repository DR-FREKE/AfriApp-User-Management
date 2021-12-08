import pkg from "mongoose";

const { Schema, model } = pkg;

const authSchema = new Schema({
  local: {
    username: {
      type: String,
      default: null,
    },
    firstname: {
      type: String,
      default: null,
    },
    lastname: {
      type: String,
      default: null,
    },
    pin: {
      type: Number,
      default: null,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    referred_by: {
      type: String,
      default: null,
    },
    referral_code: {
      type: String,
      default: null,
    },
    country_code: {
      type: String,
      default: null,
    },
    date_of_birth: {
      type: String,
      default: null,
    },
    user_avatar_url: {
      type: String,
      default: null,
    },
    phone: {
      type: String,
      default: null,
    },
    password: {
      type: String,
      // min: 8,
      default: null,
    },
    device_hash: {
      type: String,
      default: null,
    },
    last_login: {
      type: String,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    updatedAt: {
      type: Date,
      default: Date.now(),
    },
  },
  google: {
    id: String,
    name: String,
  },
});

export default model("auth", authSchema);
