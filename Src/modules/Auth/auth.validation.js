import joi from "joi";
import { generalFields } from "../../middleware/validation.js";

export const signup = joi.object({
  userName: generalFields.userName.required(),
  email: generalFields.email.required(),
  password: generalFields.password.required(),
  file: generalFields.file.required(),
  address: generalFields.address.required(),
  phoneNumber: generalFields.phoneNumber.required(),
  gender: generalFields.gender.required(),
  role: generalFields.role.required(),
});

export const doctorSignup = joi.object({
  userName: generalFields.userName.required(),
  email: generalFields.email.required(),
  password: generalFields.password.required(),
  file: generalFields.file.required(),
  address: generalFields.address.required(),
  phoneNumber: generalFields.phoneNumber.required(),
  gender: generalFields.gender.required(),
  role: generalFields.role.required(),
  licenseNumber: joi.string().required(),
  yearsOfExperience: joi.number().min(1).required(),
  consultationFees: joi.number().min(50).required(),
  bio: joi.string().min(10).max(15000),
  specialties: joi
    .array()
    .items(
      joi
        .string()
        .valid(
          "cardiology",
          "dermatology",
          "endocrinology",
          "gastroenterology",
          "hematology",
          "infectiousDisease",
          "neurology",
          "obstetricsAndGynecology(OB/GYN)",
          "oncology",
          "ophthalmology",
          "orthopedics",
          "otolaryngology(ENT)",
          "pediatrics",
          "pulmonology",
          "rheumatology",
          "urology",
          "psychiatry",
          "anesthesiology",
          "emergencyMedicine ",
          "familyMedicine"
        )
    )
    .required(),
});

export const addWorkingHours = joi.object({
  workingHours: joi
    .array()
    .items(
      joi.object({
        start: joi.string().required(),
        end: joi.string().required(),
      })
    )
    .min(5)
    .max(5)
    .required(),
});

export const login = joi.object({
  email: generalFields.email.required(),
  password: generalFields.password.required(),
});

export const confirmEmail = joi.object({
  token: generalFields.token.required(),
  role: generalFields.role.required(),
});

export const sendCode = joi.object({
  email: generalFields.email.required(),
});

export const forgotPassword = joi.object({
  email: generalFields.email.required(),
  password: generalFields.password.required(),
  code: joi.string().length(4).required(),
});
