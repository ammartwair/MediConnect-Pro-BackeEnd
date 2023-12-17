import joi from "joi";

export const generalFields = {
  userName: joi.string().min(3).max(20).required(),
  email: joi.string().email().required().min(5).message({
    "string.email": "Plz Enter a Valid Email",
    "string.empty": "Email is Required",
  }),
  password: joi.string().required().min(3).message({
    "string.empty": "Password is Required",
  }),
  file: joi.object({
    size: joi.number().positive().required(),
    path: joi.string().required(),
    filename: joi.string().required(),
    destination: joi.string().required(),
    mimetype: joi.string().required(),
    encoding: joi.string().required(),
    originalname: joi.string().required(),
    fieldname: joi.string().required(),
  }),
  token: joi.string().required(),
  gender: joi.string().valid("Male", "Female").required(),
  address: joi.string().min(3).max(20).required(),
  phoneNumber: joi.string().length(13).required(),
  role: joi.string().valid("Doctor", "Patient").required(),
};

export const validation = (schema) => {
  return (req, res, next) => {
    const inputsData = { ...req.body, ...req.params, ...req.query };
    if (req.file || req.files) {
      inputsData.file = req.file || req.files;
    }
    const validationResult = schema.validate(inputsData, { abortEarly: false });
    if (validationResult.error?.details) {
      return res.status(400).json({
        message: "validation error",
        validationError: validationResult.error.details,
      });
    }
    next();
  };
};
