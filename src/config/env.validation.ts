import Joi from "joi";

const envValidationSchema = Joi.object({
  APP_PORT: Joi.number().min(1).max(65535).default(3000),
  SWAGGER_TITLE: Joi.string(),
  SWAGGER_DESCRIPTION: Joi.string(),
  SWAGGER_VERSION: Joi.string(),
});

const envValidationOptions = {
  allowUnknown: true,
  abortEarly: false,
};

export { envValidationSchema, envValidationOptions };