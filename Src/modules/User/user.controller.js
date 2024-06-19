import doctorModel from "../../../DB/Model/Doctor.Model.js";
import patientModel from "../../../DB/Model/Patient.Model.js";
import adminModel from "../../../DB/Model/Admin.Model.js";
import cloudinary from "../../services/cloudinary.js";
import bcrypt from "bcryptjs";
import { sendEmail } from "../../services/email.js";


import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import XLSX from "xlsx";
import { createPdf } from "../../services/pdf.js";


// Accept Doctors:
export const acceptDoctors = async (req, res, next) => {

  const { id } = req.query;
  try {
    const updatedDoctor = await doctorModel.findByIdAndUpdate(
      { _id: id },
      { accepted: true },
      { new: true }
    );

    await sendEmail(
      updatedDoctor.email,
      `Subject: Application Update: Congratulations! Your Application to Join MediConnect Pro has been Accepted`,
      `<p>Dear Doctor,</p>` +
      `<p>We are delighted to inform you that your recent application to join our team at MediConnect Pro has been accepted! Congratulations!</p>` +
      `<p>Your qualifications and experience align perfectly with our requirements, and we are confident that you will make a valuable addition to our team.</p>` +
      `<p>We look forward to welcoming you aboard and working together to provide exceptional healthcare services to our patients.</p>` +
      `<p>Please let us know if you have any questions or require further information as you prepare to join our team.</p>` +
      `<p>Once again, congratulations on your acceptance, and welcome to MediConnect Pro!</p>` +
      `<p>Sincerely,</p>` +
      `<p>MediConnect Pro</p>`
    );

    return res.status(200).json({ message: "Doctor Accepted", updatedDoctor });

  } catch (error) {
    // Handle error here
    console.log(error);
    return res.json({ message: 'Error Accepting doctor:', error });
  }
};



//Make a user as an admin
export const userAdmin = async (req, res, next) => {

  const { id } = req.query;
  let doctor = true;
  let user = await doctorModel.findById({ _id: id });

  if (!user) {
    doctor = false;
    user = await patientModel.findById({ _id: id });
  }

  if (!user) {
    return next(new Error("User not found", { status: 404 }));
  }

  const createAdmin = await adminModel.create({
    userName: user.userName,
    email: user.email,
    password: user.password,
    image: user.image,
    confirmemail: user.confirmemail,
    address: user.address,
    phoneNumber: user.phoneNumber,
    gender: user.gender,
    role: "Admin",
    sendCode: user.sendCode,
    changePasswordTime: user.changePasswordTime,
  });

  if (doctor) {
    await doctorModel.findByIdAndDelete({ _id: id });
  } else {
    await patientModel.findByIdAndDelete({ _id: id });
  }
  const userName = user.userName;

  await sendEmail(
    user.email,
    `Subject: Congratulations! You've been granted admin access on MediConnect Pro`,
    `<p> Dear ${userName},</p>` +
    `<br><p>We are pleased to inform you that you have been granted administrative access to our medical clinic website, MediConnect Pro. Your expertise and dedication have made you a valuable member of our team, and we believe that trusting you with administrative responsibilities will further enhance our clinic's efficiency and service quality. </p>` +
    `<p>As an admin, you will have access to additional features and functionalities that will allow you to better manage and contribute to the operations of our clinic's online platform. Your role will include responsibilities such as managing joining requests, updating appointment schedules, and supervising various administrative tasks. </p>` +
    `<p>We trust in your professionalism and commitment to maintaining the highest standards of patient care and confidentiality. Your contributions to our clinic's success are invaluable, and we are confident that you will excel in your new role as an admin. </p>` +
    `<p>Should you have any questions or require assistance with your new administrative privileges, please do not hesitate to reach out to us. We are here to support you every step of the way. </p>` +
    `<p>Once again, congratulations on your appointment as an admin on [Medical Clinic Name]. We look forward to continuing our journey together towards providing exceptional healthcare services to our patients. </p>` +
    `<p><b>Best regards,</b></p>` +
    `<p><b>MediConnect Pro</b></p>`
  );

  return res.status(200).json({ message: "Admin Created", createAdmin });


};


// Get User:
export const getUser = async (req, res, next) => {

  const { id } = req.params;

  let user = await doctorModel.findById({ _id: id });

  if (user) {
    return res.json({ message: "Success", user });
  }

  user = await patientModel.findById({ _id: id });

  if (user) {
    return res.json({ message: "Success", user });
  }

  user = await adminModel.findById({ _id: id });

  if (user) {
    return res.json({ message: "Success", user });
  }

  return next(new Error("User not found", { status: 404 }));

};


// Get Doctors:
export const getDoctors = async (req, res, next) => {
  const doctors = await doctorModel.find({});

  if (!doctors) {
    return next(new Error("No Doctors", { status: 404 }));
  }

  return res.json({ message: "Success", doctors });
};

// Get UnAccepted Doctors:
export const doctorsUnAccepted = async (req, res, next) => {
  const doctors = await doctorModel.find({ accepted: false });

  if (!doctors) {
    return next(new Error("No Doctors", { status: 404 }));
  }

  return res.json({ message: "Success", doctors });
};


// Get Accepted Doctors:
export const doctorsAccepted = async (req, res, next) => {
  const doctors = await doctorModel.find({ accepted: true });

  if (!doctors) {
    return next(new Error("No Doctors", { status: 404 }));
  }

  return res.json({ message: "Success", doctors });
};


// Get Patients:
export const getPatients = async (req, res, next) => {
  const patients = await patientModel.find();

  if (!patients) {
    return next(new Error("No Patients", { status: 404 }));
  }

  return res.json({ message: "Success", patients });
};

// Delete User:
export const deleteUser = async (req, res, next) => {
  const id = req.params.user_id;
  const role = req.params.role;
  const model = role == "Doctor" ? doctorModel : role == "Patient" ? patientModel : adminModel;
  const user = await model.findByIdAndDelete({ _id: id });

  if (!user) {
    return next(new Error("User Not Found", { status: 404 }));
  }

  if (user.role === "Doctor" && user.accepted === false) {
    await sendEmail(
      user.email,
      `Subject: Application Update: Your Application to Join MediConnect Pro`,
      `<p>Dear Doctor,</p>` +
      `<p>We regret to inform you that your recent application to join our team at MediConnect Pro has been declined. We sincerely appreciate the time and effort you invested in applying for the position.</p>` +
      `<p>While your qualifications and experience are commendable, after careful consideration, we have decided to pursue other candidates whose skills and experience more closely align with our current needs.</p>` +
      `<p>Please note that this decision does not reflect on your abilities or qualifications. We receive numerous applications, and the selection process is highly competitive.</p>` +
      `<p>We encourage you to continue pursuing opportunities that match your skills and interests. Your dedication to providing quality healthcare is evident, and we have no doubt that you will find the right fit elsewhere.</p>` +
      `<p>Thank you once again for your interest in joining our team. We wish you all the best in your future endeavors.</p>` +
      `<p>Sincerely,</p>` +
      `<p>MediConnect Pro<br/>`
    );
  }

  return res.status(200).json({ message: "Success", user });
};

// Update User Profile Picture:
export const profilePic = async (req, res, next) => {
  if (!req.file) {
    const error = new Error("Please Provide a Picture");
    error.status = 404;
    return next(error);
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
    { image: { secure_url, public_id } },
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
    return next(new Error("Invalid Confirm Passwored!!", { status: 404 }));
  }

  const model = req.user.role == "Doctor" ? doctorModel : patientModel;
  const user = await model.findById(req.user._id);

  const match = bcrypt.compareSync(oldPassword, user.password);
  if (!match) {
    return next(new Error("Invalid Old Password", { status: 404 }));
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
    return next(new Error("User Not Found", { status: 404 }));
  }

  return res.json({ message: "Success", user });
};

// Upload Patients from Excel File
export const uploadPatientExcel = async (req, res, next) => {
  const woorBook = XLSX.readFile(req.file.path);
  const woorkSheet = woorBook.Sheets[woorBook.SheetNames[0]];

  const patients = XLSX.utils.sheet_to_json(woorkSheet);

  if (!(await patientModel.insertMany(patients))) {
    return next(new Error("Couldn not insert", { status: 400 }));
  }

  return res.status(200).json({ message: "Success" });
};

// create pdf file with patients information
export const getUsers = async (req, res, next) => {
  const patients = await patientModel.find({}).lean();
  const htmlPath = join(__dirname, "../../../templtes/pdf.html");
  await createPdf(patients, htmlPath, "PatientList.pdf", req, res);
};
