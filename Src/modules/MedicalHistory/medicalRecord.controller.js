import medicalHistoryModel from "../../../DB/Model/MedicalHistory.Model.js";
import doctorModel from "../../../DB/Model/Doctor.Model.js";
import patientModel from "../../../DB/Model/Patient.Model.js";
import { pagination } from "../../services/pagination.js";
import { Filter } from "../../services/filter.js";

// Create Medical Record
export const createMedicalRecord = async (req, res, next) => {
  const { patientId } = req.params;
  const { _id: doctorId } = req.user;

  const patient = await patientModel.findById(patientId);
  if (!patient) return next(new Error("patient not found"));

  const doctor = await doctorModel.findById({ _id: doctorId });
  if (!doctor || !doctor.patientList.includes(patientId)) {
    return next(
      new Error("Unauthorized to create medical history for this patient", {
        status: 403,
      })
    );
  }

  let medicalHistory = await medicalHistoryModel.findOne({ patientId });
  if (medicalHistory)
    return next(new Error("Patient already exists", { status: 404 }));

  medicalHistory = await medicalHistoryModel.create({
    patientId,
    ...req.body,
    DiagnosisDate: new Date(),
    createdBy: doctorId,
    updatedBy: doctorId,
  });

  return res.status(200).json({ message: "success", medicalHistory });
};

// Get all medical history records for a patient
export const getMedicalHistory = async (req, res, next) => {
  const { skip, limit } = pagination(req.query.page, req.query.limit);
  const { patientId } = req.params;

  const patient = await patientModel.findById(patientId);
  if (!patient) return next(new Error("Patient not found", { status: 404 }));

  if (req.user.role == "Doctor") {
    const { _id: doctorId } = req.user._id;
    const doctor = await doctorModel.findById({ _id: doctorId });
    if (!doctor || !doctor.patientList.includes(patientId))
      return next(
        new Error("Unauthorized to access medical history for this patient", {
          status: 403,
        })
      );
  }
  const medicalHistory = await medicalHistoryModel
    .find({ patientId })
    .skip(skip)
    .limit(limit);

  if (medicalHistory.length == 0) {
    return next(
      new Error("No medical history found for this patient", { status: 404 })
    );
  }

  if (req.user.role == "Patient" && patientId != req.user._id) {
    return next(new Error("This is not a valid patient", { status: 404 }));
  }

  return res.status(200).json({ message: "success", medicalHistory });
};

// Get a specific medical history record by medicalHistoryId
export const getMedicalHistoryById = async (req, res, next) => {
  const { medicalHistoryId } = req.params;

  const medicalHistory = await medicalHistoryModel.findById(medicalHistoryId);
  if (!medicalHistory)
    return next(new Error("Medical history not found", { status: 404 }));

  if (req.user.role == "Patient" && medicalHistory.patientId != req.user._id) {
    return next(new Error("This is not a valid patient", { status: 404 }));
  }
  if (req.user.role == "Doctor") {
    const { _id: doctorId } = req.user._id;
    const doctor = await doctorModel.findById(doctorId);
    if (!doctor || !doctor.patientList.includes(medicalHistory.patientId))
      return next(
        new Error("Unauthorized to access this medical history", {
          status: 403,
        })
      );
  }

  return res.status(200).json({ message: "success", medicalHistory });
};

// Get All Medical Histories for all patients
export const getMedicalHistoryRecords = async (req, res, next) => {
  const { skip, limit } = pagination(req.query.page, req.query.limit);
  // filter
  const queryObject = Filter({ ...req.query });

  const mongooseQuery = await medicalHistoryModel
    .find(queryObject)
    .skip(skip)
    .limit(limit);

  // Search in (diagnoses/ treatments/ medications/ allergies)
  if (req.query.search) {
    await mongooseQuery.find({
      $or: [
        { diagnoses: { $regex: req.query.search, $options: "i" } },
        { treatments: { $regex: req.query.search, $options: "i" } },
        { medications: { $regex: req.query.search, $options: "i" } },
        { allergies: { $regex: req.query.search, $options: "i" } },
      ],
    });
  }

  // Select (patientId, diagnoses, treatments, medications, allergies, labReport, DiagnosisDate, createdBy)
  if (req.query.select)
    mongooseQuery.select(req.query.select?.replaceAll(",", " "));

  // Sort (DiagnosisDate/ createdBy)
  if (req.query.sort) mongooseQuery.sort(req.query.sort?.replaceAll(",", " "));

  const medicalHistoryRecords = mongooseQuery;

  if (medicalHistoryRecords.length <= 0)
    return next(new Error("No records found", { status: 404 }));
  const count = await medicalHistoryModel.estimatedDocumentCount();

  return res.status(200).json({
    message: "success",
    Page: medicalHistoryRecords.length,
    Total: count,
    medicalHistoryRecords,
  });
};

// Update a Medical Record
export const updateMedicalRecord = async (req, res, next) => {
  const { medicalHistoryId } = req.params;
  const { _id: doctorId } = req.user._id;

  const medicalHistory = await medicalHistoryModel.findById(medicalHistoryId);
  if (!medicalHistory) {
    return next(new Error("Medical history not found", { status: 404 }));
  }

  const doctor = await doctorModel.findById({ _id: doctorId });
  if (!doctor || !doctor.patientList.includes(medicalHistory.patientId)) {
    return next(
      new Error("Unauthorized to update this medical history", {
        status: 403,
      })
    );
  }

  if (req.body.diagnoses) {
    for (const diagnose of req.body.diagnoses)
      if (!medicalHistory.diagnoses.includes(diagnose))
        medicalHistory.diagnoses.push(diagnose);
  }
  if (req.body.treatments) {
    for (const treatment of req.body.treatments)
      if (!medicalHistory.treatments.includes(treatment))
        medicalHistory.treatments.push(treatment);
  }
  if (req.body.medications) {
    for (const medication of req.body.medications)
      if (!medicalHistory.medications.includes(medication))
        medicalHistory.medications.push(medication);
  }
  if (req.body.allergies) {
    for (const allergie of req.body.allergies)
      if (!medicalHistory.allergies.includes(allergie))
        medicalHistory.allergies.push(allergie);
  }
  if (req.body.labResult) {
    for (const labResult of req.body.labResult)
      if (!medicalHistory.labResult.includes(labResult))
        medicalHistory.labResult.push(labResult);
  }

  medicalHistory.updatedBy = req.user._id;

  await medicalHistory.save();
  return res.status(200).json({ message: "success", medicalHistory });
};

// Delete a specific medical history record
export const deleteMedicalHistoryRecord = async (req, res, next) => {
  const { medicalHistoryId } = req.params;
  const { _id: doctorId } = req.user._id;

  const medicalHistory = await medicalHistoryModel.findById(medicalHistoryId);
  if (!medicalHistory)
    return next(new Error("Medical history not found", { status: 404 }));

  const doctor = await doctorModel.findById(doctorId);
  if (!doctor || !doctor.patientList.includes(medicalHistory.patientId)) {
    return next(
      new Error("Unauthorized to delete this medical history", { status: 403 })
    );
  }

  await medicalHistoryModel.findByIdAndDelete(medicalHistoryId);

  return res.status(200).json({ message: "success", medicalHistory });
};

// Delete all medical history records for a patient
export const deleteMedicalHistory = async (req, res, next) => {
  const { patientId } = req.params;
  const { _id: doctorId } = req.user._id;

  const doctor = await doctorModel.findById(doctorId);
  if (!doctor || !doctor.patientList.includes(patientId)) {
    return next(
      new Error("Unauthorized to delete medical history for this patient", {
        status: 403,
      })
    );
  }

  const medicalHistoryRecords = await medicalHistoryModel.find({ patientId });
  if (medicalHistoryRecords.length == 0) {
    return next(
      new Error("No medical history found for this patient", { status: 404 })
    );
  }

  for (const record of medicalHistoryRecords) {
    await medicalHistoryModel.findByIdAndDelete(record._id);
  }

  return res.status(200).json({ message: "success", medicalHistoryRecords });
};
