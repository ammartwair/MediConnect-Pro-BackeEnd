import doctorModel from "../../../DB/Model/Doctor.Model.js";
import patientModel from "../../../DB/Model/Patient.Model.js";
import cloudinary from "../../services/cloudinary.js";
import bcrypt from "bcryptjs";

import XLSX from 'xlsx';
import { createPdf } from '../../services/pdf.js';

// Get Doctors:
export const getDoctors = async (req, res, next) => {
  const doctors = await doctorModel.find({});

  if (!doctors) {
    return next(new Error("No Doctors", { cause: 404 }));
  }

  return res.json({ message: "Success", doctors });
};

// Get Patients:
export const getPatients = async (req, res, next) => {
  const patients = await patientModel.find();

  if (!patients) {
    return next(new Error("No Patients", { cause: 404 }));
  }

  return res.json({ message: "Success", patients });
};

// Delete User:
export const deleteUser = async (req, res, next) => {
  const id = req.params.user_id;

  const model = req.params.role == "Doctor" ? doctorModel : patientModel;
  const user = await model.findByIdAndDelete({ _id: id });

  if (!user) {
    return next(new Error("User Not Found", { cause: 404 }));
  }

  return res.status(200).json({ message: "Success", user });
};

// Update User Profile Picture:
export const profilePic = async (req, res, next) => {
  if (!req.file) {
    return next(new Error("Please Provide a Picture", { cause: 404 }));
  }

  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: `${process.env.APP_NAME}/user/${req.user._id}/profile`,
    }
  );

  const model = req.user.role == "Doctor" ? doctorModel : patientModel;

  const user = await model.findByIdAndUpdate(
    req.user._id,
    { profilepic: { secure_url, public_id } },
    { new: true }
  );

  if (user.profilepic) {
    await cloudinary.uploader.destroy(user.profilepic.public_id);
  }
  return res.status(200).json({ message: "success", user });
};

//Update Password:
export const updatePassword = async (req, res, next) => {
  const { oldPassword, newPassword, cPassword } = req.body;

  if (newPassword !== cPassword) {
    return next(new Error("Invalid Confirm Passwored!!", { cause: 404 }));
  }

  const model = req.user.role == "Doctor" ? doctorModel : patientModel;
  const user = await model.findById(req.user._id);

  const match = bcrypt.compareSync(oldPassword, user.password);
  if (!match) {
    return next(new Error("Invalid Old Password", { cause: 404 }));
  }

  const hashedPassword = bcrypt.hashSync(
    newPassword,
    parseInt(process.env.SALTROUND)
  );

  user.password = hashedPassword;
  user.save();
  return res.status(200).json({ message: "Success", user });
};

//Get Profile:
export const getProfile = async (req, res, next) => {
  const model = req.user.role == "Doctor" ? doctorModel : patientModel;

  const user = await model.findById({ _id: req.user._id });

  if (!user) {
    return next(new Error("User Not Found", { cause: 404 }));
  }

  return res.json({ message: "Success", user });
};

// Upload Patients from Excel File
export const uploadPatientExcel = async (req, res, next) => {
  const woorBook = XLSX.readFile(req.file.path);
  const woorkSheet = woorBook.Sheets[woorBook.SheetNames[0]];

  const patients = XLSX.utils.sheet_to_json(woorkSheet);

  if (!(await patientModel.insertMany(patients))) {
    return next(new Error("Couldn not insert", { cause: 400 }));
  }

  return res.status(200).json({ message: "Success" });
};

// create pdf file with patients information
export const getUsers = async (req, res, next) => {
  const patients = await patientModel.find({}).lean();
  await createPdf(patients, "PatientList.pdf", req, res);
};
