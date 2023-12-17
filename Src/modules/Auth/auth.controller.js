import doctorModel from "../../../DB/Model/Doctor.Model.js";
import patientModel from "../../../DB/Model/Patient.Model.js";
import bcrypt from "bcryptjs";
import cloudinary from "../../services/cloudinary.js";
import jwt from "jsonwebtoken";
import { sendEmail } from "../../services/email.js";
import { customAlphabet } from "nanoid";

export const signup = async (req, res, next) => {
  const { userName, email, password, role } = req.body;
  let user = null;
  let model = role == "Doctor" ? doctorModel : patientModel;
  user = await model.findOne({ email });
  if (user) {
    return next(new Error("User Already Registered", { cause: 409 }));
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
    `To  Verify Your Email <a href='${req.protocol}://${req.headers.host}/auth/confirmEmail/${token}/${role}'>Click Here</a>`
  );
  let createUser = null;
  createUser = await model.create(req.body);
  return res.status(200).json({ message: "Created", createUser, token });
};

export const login = async (req, res, next) => {
  const { email, password, role } = req.body;
  let user = null;
  let model = role == "Doctor" ? doctorModel : patientModel;
  user = await model.findOne({ email });

  if (!user) {
    return next(new Error("User Not Found!", { cause: 409 }));
  }
  if (!user.confirmEmail) {
    return next(new Error("Plz Confirm Your Email ^_^", { cause: 400 }));
  }
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return next(new Error("Invalid Password!!", { cause: 400 }));
  }
  const token = jwt.sign(
    { id: user._id, role: user.role, status: user.status },
    process.env.LOG_IN_SECRET,
    { expiresIn: 60 * 60 * 24 }
  );
  const refreshToken = jwt.sign(
    { id: user._id, role: user.role, status: user.status },
    process.env.LOG_IN_SECRET,
    { expiresIn: 60 * 60 * 24 * 30 }
  );
  return res
    .status(200)
    .json({ message: "Login successful", token, refreshToken });
};

export const confirmEmail = async (req, res, next) => {
  const { token, role } = req.params;
  const decoded = jwt.verify(token, process.env.SIGN_UP_SECRET);
  if (!decoded) {
    return next(new Error("Invalid Token", { cause: 404 }));
  }
  let user = null;
  let model = role == "Doctor" ? doctorModel : patientModel;
  user = await model.findOneAndUpdate(
    {
      email: decoded.email,
      confirmEmail: false,
    },
    { confirmEmail: true }
  );
  if (!user) {
    return next(
      new Error("Invalid verify your email OR Your email is verified", {
        cause: 400,
      })
    );
  }
  return res.redirect(process.env.FRONTEND_URL);
};

export const sendCode = async (req, res, next) => {
  const { email, role } = req.body;
  let code = customAlphabet("1234567890abcdzABCDZ", 4);
  code = code();
  let user = null;
  let model = role == "Doctor" ? doctorModel : patientModel;
  user = await model.findOneAndUpdate(
    { email },
    { sendCode: code },
    { new: true }
  );

  if (!user) {
    return next(new Error("Email Not Found!", { cause: 409 }));
  }

  const html = `<h3>Code is <em>${code}</em></h3>`;
  await sendEmail(email, "Reset Password", html);
  return res.status(200).json({ message: `Code is ${code}` });
};

export const forgotPassword = async (req, res, next) => {
  const { email, password, code, role } = req.body;
  let user = null;
  let model = role == "Doctor" ? doctorModel : patientModel;
  user = await model.findOne({ email });
  if (!user) {
    return next(new Error("User Not Found!", { cause: 409 }));
  }

  if (user.sendCode !== code) {
    return next(new Error("Invalid Code!", { cause: 400 }));
  }
  let match = await bcrypt.compare(password, user.password);
  if (match) {
    return next(new Error("Same Password", { cause: 409 }));
  }
  user.password = await bcrypt.hash(password, parseInt(process.env.SALTROUND));
  user.sendCode = null;
  user.changePasswordTime = Date.now();

  await user.save();

  return res.status(200).json({ message: "Password is Changed" });
};

export const deleteInvalidConfirm = async (req, res, next) => {
  let users = null;
  let model = req.body.role == "Doctor" ? doctorModel : patientModel;
  users = await model.deleteMany({ confirmEmail: false });

  if (!users.deletedCount) {
    return next(new Error("Users Not Found", { cause: 409 }));
  }
  return res.status(200).json({ message: "Successfully deleted" });
};
