import * as Joi from "joi";

const envValidationSchema = Joi.object({
  APP_PORT: Joi.number().min(1).max(65535).default(3000),
  SWAGGER_TITLE: Joi.string(),
  SWAGGER_DESCRIPTION: Joi.string(),
  SWAGGER_VERSION: Joi.string(),
  SWAGGER_PASSWORD: Joi.string().required(),
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().default(5432),
  DB_USER: Joi.string().required(),
  DB_PASS: Joi.string().required(),
  DB_NAME: Joi.string().required(),
});

const envValidationOptions = {
  allowUnknown: true,
  abortEarly: false,
};

export { envValidationSchema, envValidationOptions };