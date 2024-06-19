import doctorModel from "../../../DB/Model/Doctor.Model.js";
import patientModel from "../../../DB/Model/Patient.Model.js";
import bcrypt from "bcryptjs";
import cloudinary from "../../services/cloudinary.js";
import jwt from "jsonwebtoken";
import { sendEmail } from "../../services/email.js";
import { customAlphabet } from "nanoid";
import adminModel from "../../../DB/Model/Admin.Model.js";

//Sign up:
export const signup = async (req, res, next) => {
  const { userName, email, password, role } = req.body;
  const model = role == "Doctor" ? doctorModel : patientModel;
  let user = await model.findOne({ email });
  if (user) {
    return next(new Error("User Already Registered", { status: 409 }));
  }
  user = await adminModel.findOne({email});
  if (user) {
    return next(new Error("User Already Registered", { status: 409 }));
  }

  req.body.password = bcrypt.hashSync(
    password,
    parseInt(process.env.SALTROUND)
  );

  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: `${process.env.APP_NAME}/Users/${role}s/${userName}`,
    }
  );
  req.body.image = { secure_url, public_id };

  const token = jwt.sign({ email }, process.env.SIGN_UP_SECRET);

  await sendEmail(
    email,
    "Confirm Email",
    `To  Verify Your Email <a href='${req.protocol}://${req.headers.host}/auth/confirmEmail/${role}/${token}'>Click Here</a>`
  );

  const createUser = await model.create(req.body);

  return res.status(200).json({ message: "User Created", createUser, token });

};

export const addWorkingHours = async (req, res, next) => {
  const { workingHours } = req.body;
  const doctor = await doctorModel.findOneAndUpdate(
    { _id: req.user._id },
    { workingHours },
    { new: true }
  );
  if (!doctor) {
    return next(
      new Error("Can't add working hours to doctor", { status: 404 })
    );
  }
  return res
    .status(200)
    .json({ message: "Success Adding Working Hours", doctor });

};

//Log in:
export const login = async (req, res, next) => {
  const { email, password } = req.body;
  let user = null;
  let doctor = await doctorModel.findOne({ email });
  let patient = null;
  let admin = null;
  let checkAdmin = false;

  if (!doctor) {
    patient = await patientModel.findOne({ email });
    if (!patient) {
      admin = await adminModel.findOne({ email });
      if (!admin) {
        return next(new Error("User Not Registered", { status: 409 }));
      }
      user = admin;
      checkAdmin = true;
    } else {
      user = patient;
    }
  } else {
    user = doctor;
    if (user.accepted === false) {
      return res.json({ message: "Doctor is not accepted yet" });
    }
  }
  if (!user.confirmEmail) {
    return res.json({ message: "Email is not confirmed" });
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return next(new Error("Invalid Password!!", { status: 400 }));

  }

  const token = jwt.sign(
    { id: user._id, role: user.role, status: user.status, isAdmin: checkAdmin },
    process.env.LOG_IN_SECRET,
    { expiresIn: 60 * 60 * 24 }
  );

  const refreshToken = jwt.sign(
    { id: user._id, role: user.role, status: user.status, isAdmin: checkAdmin },
    process.env.LOG_IN_SECRET,
    { expiresIn: 60 * 60 * 24 * 30 }
  );

  return res
    .status(200)
    .json({ message: "Login successful", token, refreshToken });
};

//Confirm Email:
export const confirmEmail = async (req, res, next) => {
  const { token, role } = req.params;

  const decoded = jwt.verify(token, process.env.SIGN_UP_SECRET);
  if (!decoded) {
    return next(new Error("Invalid Token", { status: 404 }));
  }

  const model = role == "Doctor" ? doctorModel : patientModel;
  const user = await model.findOneAndUpdate(
    {
      email: decoded.email,
      confirmEmail: false,
    },
    { confirmEmail: true }
  );

  if (!user) {
    return next(
      new Error("Invalid verify your email OR Your email is already verified", {
        status: 400,
      })
    );
  }

  return res.redirect(process.env.FRONTEND_URL);
};

//Send Code for Forgot Password:
export const sendCode = async (req, res, next) => {
  const { email } = req.body;

  let doctor = await doctorModel.findOne({ email });
  let checkConfirmation = doctor;
  let patient = null;
  let model = null;
  let admin = null;

  if (!doctor) {
    patient = await patientModel.findOne({ email });
    checkConfirmation = patient;
    if (!patient) {
      admin = await adminModel.findOne({ email });
      if (!admin) {
        return next(new Error("User Not Registered", { status: 409 }));
      }
      model = adminModel;
    } else {
      model = patientModel;
    }
  } else {
    model = doctorModel;
  }

  if (checkConfirmation.confirmEmail == false) {
    return next(new Error("Email is not Confirmed", { status: 404 }));
  }


  let code = customAlphabet("1234567890abcdzABCDZ", 4);
  code = code();

  await model.findOneAndUpdate({ email }, { sendCode: code }, { new: true });

  const html = `<h3>Code is <em>${code}</em></h3>`;
  await sendEmail(email, "Reset Password", html);

  return res.status(200).json({ message: 'Done', code: `Code is ${code}` });
};

//Forgot Password:
export const forgotPassword = async (req, res, next) => {
  const { email, password, code } = req.body;

  let user = null;
  let doctor = await doctorModel.findOne({ email });
  let patient = null;
  let admin = null;

  if (!doctor) {
    patient = await patientModel.findOne({ email });
    if (!patient) {
      admin = await adminModel.findOne({ email });
      if (!admin) {
        return next(new Error("User Not Registered", { status: 409 }));
      }
      user = admin;
    } else {
      user = patient;
    }
  } else {
    user = doctor;
  }

  if (user.sendCode !== code) {
    return next(new Error("Invalid Code!", { status: 400 }));
  }

  let match = await bcrypt.compare(password, user.password);
  if (match) {
    return next(new Error("Same Password", { status: 409 }));
  }

  user.password = await bcrypt.hash(password, parseInt(process.env.SALTROUND));
  user.sendCode = null;
  user.changePasswordTime = Date.now();

  await user.save();

  return res.status(200).json({ message: "Password is Changed" });
};

//Delete Invalid Confirm Email For Doctors:
export const deleteInvalidConfirmDoctors = async (req, res, next) => {
  const users = await doctorModel.deleteMany({ confirmEmail: false });

  if (!users.deletedCount) {
    return next(new Error("Users Not Found", { status: 409 }));
  }
  return res.status(200).json({ message: "Successfully deleted" });
};

//Delete Invalid Confirm Email For Patient:
export const deleteInvalidConfirmPatients = async (req, res, next) => {
  const users = await patientModel.deleteMany({ confirmEmail: false });

  if (!users.deletedCount) {
    return next(new Error("Users Not Found", { status: 409 }));
  }
  return res.status(200).json({ message: "Successfully deleted" });
};
