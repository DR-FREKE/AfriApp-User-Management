import "babel-polyfill";
import Joi from "joi";

const max = 4;

export const registerValidator = (data) => {
  const schema = Joi.object({
    username: Joi.string().min(6).required(),
    phone: Joi.string().required(),
    password: Joi.string().min(6),
    device_hash: Joi.string().required(),
  });

  return schema.validate(data);
};

export const loginValidator = (data) => {
  const schema = Joi.object({
    phone: Joi.string().required(),
    password: Joi.string().min(6),
  });

  return schema.validate(data);
};

export const otpValidator = (data) => {
  const schema = Joi.object({
    phone: Joi.string().required(),
    otp_token: Joi.string().max(max).required(),
  });

  return schema.validate(data);
};

export const passwordResetValidator = (data) => {
  const schema = Joi.object({
    phone: Joi.string().required(),
    old_password: Joi.string().required(),
    new_password: Joi.string().min(6).required(),
  });

  return schema.validate(data);
};

export const phoneValidator = (data) => {
  const schema = Joi.object({
    phone: Joi.string().required(),
  });

  return schema.validate(data);
};

export const validateNewPassword = (data) => {
  const schema = Joi.object({
    otp_token: Joi.string().max(4).required(),
    phone: Joi.string().required(),
    new_password: Joi.string().required(),
  });

  return schema.validate(data);
};

export const pinValidator = (data) => {
  const schema = Joi.object({
    pin: Joi.string().max(max).required(),
  });

  return schema.validate(data);
};

export const pinCreateValidator = (data) => {
  const schema = Joi.object({
    phone: Joi.string().required(), // might be device hash later
    pin: Joi.string().max(max).required(),
    confirm_pin: Joi.string().max(max).required(),
  });

  return schema.validate(data);
};

export const pinResetValidator = (data) => {
  const schema = Joi.object({
    phone: Joi.string().required(),
    new_pin: Joi.string().max(max).required(),
    confirm_new_pin: Joi.string().max(max).required(),
  });

  return schema.validate(data);
};

export const pinReValidator = (data) => {
  const schema = Joi.object({
    phone: Joi.string().required(),
    pin: Joi.string().max(max).required(),
  });

  return schema.validate(data);
};
