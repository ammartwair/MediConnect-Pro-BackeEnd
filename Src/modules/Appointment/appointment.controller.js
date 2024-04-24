import appointmentModel from "../../../DB/Model/Appointment.Model.js";
import doctorModel from "../../../DB/Model/Doctor.Model.js";
import patientModel from "../../../DB/Model/Patient.Model.js";
import { sendEmail } from "../../services/email.js";

// Book Appointment
export const bookAppointment = async (req, res, next) => {
  let { doctorId, date, startTime, endTime, reasonForVisit } = req.body;
  const patientId = req.user._id;

  date = new Date(date);
  startTime = new Date(startTime);
  endTime = new Date(endTime);

  const duration = (endTime - startTime) / (1000 * 60); // in minutes

  if (duration < 15 || duration > 60) {
    return next(new Error("Appointment Duration must be between 15 and 60"));
  }

  let doctor = await doctorModel.findById({ _id: doctorId });
  if (!doctor) {
    return next(new Error("Doctor not found"));
  }

  const { available, availableMessage } = await isDoctorAvailable(
    doctor,
    date,
    startTime,
    endTime
  );
  if (!available) {
    return next(new Error(availableMessage, { cause: 404 }));
  }

  const { conflict, conflictMessage } = await hasAppointmentConflict(
    patientId,
    date,
    startTime,
    endTime,
    "Patient"
  );
  if (conflict) {
    return next(new Error(conflictMessage, { cause: 404 }));
  }

  const { conflict: doctorConflict, conflictMessage: doctorConflictMessage } =
    await hasAppointmentConflict(doctorId, date, startTime, endTime, "Doctor");
  if (doctorConflict) {
    return next(new Error(doctorConflictMessage, { cause: 404 }));
  }

  const appointment = await appointmentModel.create({
    doctorId,
    patientId,
    date,
    startTime,
    endTime,
    duration,
    reasonForVisit,
    status: "pending",
    paymentStatus: "pending",
    createdBy: patientId,
    updatedBy: patientId,
    notes: req.body.notes || "",
  });

  const patient = await patientModel.findByIdAndUpdate(
    { _id: patientId },
    {
      $push: {
        currentAppointments: appointment._id,
      },
    },
    { new: true }
  );

  if (!doctor.patientList.includes(patientId)) {
    doctor.patientList.push(patientId);
  }
  doctor.currentAppointments.push(appointment._id);
  doctor.save();

  const formatDate = formateDate(date);
  const formatStart = formateTime(startTime);
  const formatEnd = formateTime(endTime);

  await sendEmail(
    patient.email,
    "Appointment Confirmation",
    `<p>You have successfully booked an appointment with Dr.${doctor.userName} <br> on ${formatDate} from ${formatStart} to ${formatEnd}</p>`
  );

  await sendEmail(
    doctor.email,
    "New Appointment",
    `<p>You have a new appointment with patient ${patient.userName} on ${formatDate} from ${formatStart} to ${formatEnd}</p>`
  );

  return res.status(200).json({ message: "Success Booking", appointment });
};

// Get Doctor Appointments
export const getDoctorAppointments = async (req, res, next) => {
  const appointments = await appointmentModel
    .find({
      doctorId: req.user._id,
      status: "booked",
    })
    .select("date doctorId patientId status");
  if (appointments?.length == 0) {
    return next(new Error("Doctor has no appointments!!"));
  }

  return res.status(200).json(appointments);
};

//Get Patient Appointments
export const getPatientAppointments = async (req, res, next) => {
  const appointments = await appointmentModel
    .find({
      patientId: req.user._id,
      status: "booked",
    })
    .select("date doctorId patientId status");

  if (appointments?.length == 0) {
    return next(new Error("Patient has no appointments!!"));
  }

  return res.status(200).json(appointments);
};

//Get Appointment Details
export const getAppointmentDetails = async (req, res, next) => {
  const appointment = await appointmentModel.findById({ _id: req.params.id });

  if (!appointment) {
    return next(
      new Error(`There is No Appointment With ID: ${req.params.id} `, {
        cause: 404,
      })
    );
  }

  return res.status(200).json({ message: "Success", appointment });
};

// Cancel Appointment
export const cancelAppointment = async (req, res, next) => {
  const { appointmentId } = req.params;
  const patientId = req.user._id;

  let appointment = await appointmentModel.findById(appointmentId);

  if (
    !appointment ||
    appointment.patientId.toString() !== patientId.toString()
  ) {
    return next(new Error("Appointment not found", { cause: 404 }));
  }

  if (appointment.status == "complete" || appointment.status == "cancelled") {
    return next(new Error("Can't Cancel This Appointment", { cause: 404 }));
  }

  appointment = await appointmentModel.findByIdAndUpdate(
    { _id: appointmentId },
    { status: "cancelled" },
    { new: true }
  );

  const patient = await patientModel.findByIdAndUpdate(patientId, {
    $pull: { currentAppointments: appointmentId },
  });

  const doctor = await doctorModel.findByIdAndUpdate(appointment.doctorId, {
    $pull: { currentAppointments: appointmentId },
  });

  await sendEmail(
    patient.email,
    "Appointment Deleted",
    `<p>You have delete an appointment with Dr.${doctor.userName}</p>`
  );

  await sendEmail(
    doctor.email,
    "Appointment Deleted",
    `<p>Your appointment with patient ${patient.userName} has been deleted</p>`
  );

  return res
    .status(200)
    .json({ message: "Appointment cancelled", appointment });
};

//Update Appointment
export const updateAppointment = async (req, res, next) => {
  const { appointmentId } = req.params;
  let { doctorId, date, startTime, endTime } = req.body;
  const patientId = req.user._id;

  let appointment = await appointmentModel.findById(appointmentId);
  if (
    !appointment ||
    appointment.patientId.toString() !== patientId.toString()
  ) {
    return next(new Error("Appointment not found", { cause: 404 }));
  }

  date = new Date(date);
  startTime = new Date(startTime);
  endTime = new Date(endTime);

  const duration = (endTime - startTime) / (1000 * 60); // in minutes

  if (duration < 15 || duration > 60) {
    return next(new Error("Appointment Duration must be between 15 and 60"));
  }

  let doctor = await doctorModel.findById({ _id: doctorId });
  if (!doctor) {
    return next(new Error("Doctor not found"));
  }

  const patient = await patientModel.findById(patientId);
  if (!patient) {
    return next(new Error("patient not found", { cause: 404 }));
  }

  const { available, availableMessage } = await isDoctorAvailable(
    doctor,
    date,
    startTime,
    endTime
  );
  if (!available) {
    return next(new Error(availableMessage, { cause: 404 }));
  }

  const { conflict, conflictMessage } = await hasAppointmentConflict(
    patientId,
    date,
    startTime,
    endTime,
    "Patient"
  );
  if (conflict) {
    return next(new Error(conflictMessage, { cause: 404 }));
  }

  const { conflict: doctorConflict, conflictMessage: doctorConflictMessage } =
    await hasAppointmentConflict(doctorId, date, startTime, endTime, "Doctor");
  if (doctorConflict) {
    return next(new Error(doctorConflictMessage, { cause: 404 }));
  }
  let newDoctor = false;

  if (doctorId.toString() != appointment.doctorId.toString()) {
    newDoctor = true;
  }

  appointment = await appointmentModel.findByIdAndUpdate(appointmentId, {
    doctorId,
    patientId,
    date,
    startTime,
    endTime,
    duration,
    reasonForVisit: req.body.reasonForVisit || appointment.reasonForVisit,
    status: "pending",
    paymentStatus: "pending",
    updatedBy: patientId,
    notes: req.body.notes || appointment.notes,
  });

  const formatDate = formateDate(date);
  const formatStart = formateTime(startTime);
  const formatEnd = formateTime(endTime);

  await sendEmail(
    patient.email,
    "Appointment Confirmation",
    `<p>You have successfully update your appointment <br> The new appointment is with Dr.${doctor.userName} on ${formatDate} from ${formatStart} to ${formatEnd}</p>`
  );

  if (newDoctor) {
    if (!doctor.patientList.includes(patientId)) {
      doctor.patientList.push(patientId);
    }
    doctor.save();
    await sendEmail(
      doctor.email,
      "New Appointment",
      `<p>You have a new appointment with patient ${patient.userName} on ${formatDate} from ${formatStart} to ${formatEnd}</p>`
    );
  }

  await sendEmail(
    doctor.email,
    "Update Appointment",
    `<p>Your appointment with patient ${patient.userName} has been updated <br> The new appointment is on ${formatDate} from ${formatStart} to ${formatEnd}</p>`
  );

  return res.status(200).json({ message: "Updated Appointment", appointment });
};

// Change Appointment Status
export const changeAppointmentStatus = async (req, res, next) => {
  const { appointmentId } = req.params;
  const { status } = req.body;

  let appointment = await appointmentModel.findById(appointmentId);
  if (!appointment) {
    return next(new Error("Appointment not found", { cause: 404 }));
  }

  if (
    (appointment.status == "pending" && status == "confirmed") ||
    ((appointment.status == "confirmed" || appointment.status == "pending") &&
      status == "cancelled") ||
    (appointment.status == "confirmed" && status == "complete")
  ) {
    appointment = await appointmentModel.findByIdAndUpdate(
      { _id: appointmentId },
      {
        status,
      },
      { new: true }
    );

    const patient = await patientModel.findById({ _id: appointment.patientId });
    const doctor = await doctorModel.findById({ _id: appointment.doctorId });

    await sendEmail(
      patient.email,
      "Appointment Status",
      `<p>You had an appointment with Dr.${doctor.userName}, and the status of that appointment was changed to ${status}</p>
      <br>To Show the appointment details <a href='${req.protocol}://${req.headers.host}/book/getAppointmentDetails/${appointmentId}'>Click Here</a>`
    );
    await sendEmail(
      doctor.email,
      "Appointment Status",
      `<p>You had an appointment with the patient ${patient.userName}, and the status of that appointment was changed to ${status}</p>
      <br>To Show the appointment details <a href='${req.protocol}://${req.headers.host}/book/getAppointmentDetails/${appointmentId}'>Click Here</a>`
    );

    return res
      .status(200)
      .json({ message: "Updated Appointment Status", appointment });
  }

  return next(
    new Error(`Can't Change Status from ${appointment.status} to ${status}`, {
      cause: 404,
    })
  );
};

// Change Appointment Payment Status
export const changePaymentStatus = async (req, res, next) => {
  const { appointmentId } = req.params;
  const { paymentStatus } = req.body;

  let appointment = await appointmentModel.findById(appointmentId);
  if (!appointment) {
    return next(new Error("Appointment not found", { cause: 404 }));
  }

  if (appointment.status == "cancelled" && paymentStatus != "cancelled") {
    return next(
      new Error(
        "The appointment is cancelled => You must cancel the payment status",
        { cause: 404 }
      )
    );
  }

  appointment = await appointmentModel.findByIdAndUpdate(
    { _id: appointmentId },
    { paymentStatus },
    { new: true }
  );

  const patient = await patientModel.findById(appointment.patientId);
  if (paymentStatus == "failed") {
    await sendEmail(
      patient.email,
      "Faild Payment",
      `<p>The payment was not completed successfully :( <br>For more information, refer to the relevant authorities</p>`
    );
  } else if(paymentStatus == "paid"){
    await sendEmail(
      patient.email,
      "Success Payment",
      `<p>The payment was completed successfully ^_^</p>`
    );
  }
  return res
    .status(200)
    .json({ message: "appointment successfully updated", appointment });
};

// Helper Functions

async function isDoctorAvailable(doctor, date, startTime, endTime) {
  let available = true;
  let availableMessage = "Doctor is Available";

  // Check if the requested date is within the doctor's working days
  let dateDay = date.getDay();

  if (dateDay > 4 || dateDay < 0) {
    available = false;
    availableMessage = "Doctor does not work on this day";
  } else {
    const workingDay = doctor.workingHours[dateDay];

    // Check if the requested time falls within the doctor's working hours
    const doctorStartTime = new Date(date);
    doctorStartTime.setHours(
      workingDay.start.getHours(),
      workingDay.start.getMinutes(),
      0,
      0
    );
    const doctorEndTime = new Date(date);
    doctorEndTime.setHours(
      workingDay.end.getHours(),
      workingDay.end.getMinutes(),
      0,
      0
    );

    if (
      startTime < doctorStartTime ||
      endTime > doctorEndTime ||
      startTime >= endTime
    ) {
      available = false;
      availableMessage = "Doctor is not available at the requested time";
    }
  }
  return { available, availableMessage };
}

async function hasAppointmentConflict(
  entityId,
  date,
  startTime,
  endTime,
  entityType
) {
  let conflict = false;
  let conflictMessage = `${entityType} does not have a conflicting appointment`;

  let existingAppointments;
  if (entityType === "Patient") {
    existingAppointments = await appointmentModel.find({
      patientId: entityId,
      date,
      $or: [
        {
          startTime: { $lt: endTime },
          endTime: { $gt: startTime },
        },
      ],
    });
  } else {
    existingAppointments = await appointmentModel.find({
      doctorId: entityId,
      date,
      $or: [
        {
          startTime: { $lt: endTime },
          endTime: { $gt: startTime },
        },
      ],
    });
  }

  if (existingAppointments.length > 0) {
    return {
      conflict: true,
      conflictMessage: `${entityType} already has a conflicting appointment`,
    };
  }

  return { conflict, conflictMessage };
}

function formateDate(date) {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  return `${days[date.getDay()]} ${date.getFullYear()}-${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
}

function formateTime(time) {
  return `${time.getUTCHours().toString().padStart(2, "0")}:${time
    .getUTCMinutes()
    .toString()
    .padStart(2, "0")}`;
}
