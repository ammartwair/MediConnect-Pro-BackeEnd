import appointmentModel from "../../../DB/Model/Appointment.Model.js";
import doctorModel from "../../../DB/Model/Doctor.Model.js";
import notificationModel from "../../../DB/Model/Notification.Model.js";
import patientModel from "../../../DB/Model/Patient.Model.js";
import { formateDate, formateTime } from "../../services/formatDateTime.js";
import { sendEmail } from "../../services/email.js";
import { pagination } from "../../services/pagination.js";

// Get a notification
export const getNotification = async (req, res, next) => {
  const { notificationId } = req.params;

  const notification = await notificationModel.findById(notificationId);
  if (!notification)
    return next(new Error("notification not found", { status: 404 }));

  if (
    req.user.role == "Patient" &&
    notification.patientId.toString() != req.user._id.toString()
  )
    return next(
      new Error("This is not your own notification", { status: 403 })
    );

  return res
    .status(200)
    .json({ message: "success", Notification: notification.message });
};

// Get a notification
export const getAllNotifications = async (req, res, next) => {
  const { patientId } = req.params;
  const { skip, limit } = pagination(req.query.page, req.query.limit);
  if (
    req.user.role == "Patient" &&
    patientId.toString() != req.user._id.toString()
  )
    return next(
      new Error("This is not your own notifications", { status: 403 })
    );

  const notifications = await notificationModel
    .find({ patientId })
    .skip(skip)
    .limit(limit);

  if (notifications.length <= 0)
    return next(
      new Error("This patient has no notifications", { status: 404 })
    );

  return res.status(200).json({ message: "success", notifications });
};

// Craete a new notification
export const createNotification = async (req, res, next) => {
  const { patientId } = req.params;

  const patient = await patientModel.findById(patientId);
  if (!patient) return next(new Error("Patient not found", { status: 404 }));

  const appointment = await appointmentModel.findOne({
    patientId,
    date: { $gte: new Date() },
  });
  if (!appointment)
    return next(new Error("No upcoming appointment found", { status: 404 }));

  let notification = await notificationModel.find({
    patientId,
    appointmentId: appointment._id,
  });
  if (notification)
    return next(
      new Error("Patient has a notification for this appointment", {
        status: 404,
      })
    );

  const doctor = await doctorModel.findById(appointment.doctorId);

  const message = `Reminder: You have an appointment with Dr. ${
    doctor.userName
  } on ${formateDate(appointment.date)} at ${formateTime(
    appointment.startTime
  )}`;

  notification = await notificationModel.create({
    patientId,
    appointmentId: appointment._id,
    message,
    status: "unread",
  });

  await sendEmail(
    patient.email,
    "Reminder Notification",
    `<p>${notification.message}</p>
    <a href='${req.protocol}://${req.headers.host}/notification/markAsRead/${notification._id}'>Mark As Read</a>`
  );

  return res
    .status(200)
    .json({ message: "Notification successfully created", notification });
};

// Mark a notification as read
export const markAsRead = async (req, res, next) => {
  const { notificationId } = req.params;

  const notification = await notificationModel.findByIdAndUpdate(
    notificationId,
    { status: "read" },
    { new: true }
  );
  if (!notification) return next(new Error("Not Found", { status: 404 }));

  return res.status(200).json({ message: "Success", notification });
};

// Mark all notifications for a recipient as read
export const markAllAsRead = async (req, res, next) => {
  const { patientId } = req.params;

  const patient = await patientModel.findById(patientId);
  if (!patient) return next(new Error("Patient not Found", { status: 404 }));

  const notifications = await notificationModel.find({ patientId });
  if (notifications.length <= 0)
    return next(new Error("Patient has no notifications", { status: 404 }));

  for (const notification of notifications) {
    notification.status = "read";
    notification.save();
  }

  return res.status(200).json({ message: "success", notifications });
};

// Delete a notification
export const deleteNotification = async (req, res, next) => {
  const { notificationId } = req.params;

  const notification = await notificationModel.findById(notificationId);
  if (!notification)
    return next(new Error("Notification not found", { status: 404 }));

  if (
    req.user.role == "Patient" &&
    req.user._id.toString() != notification.patientId.toString()
  )
    return next(
      new Error("You are not allowed to delete this notification", {
        status: 403,
      })
    );
  notification = await notificationModel.deleteOne({ _id: notificationId });
  return res.status(200).json({ message: "success", notification });
};

// Delete all patient notifications
export const deleteAllNotifications = async (req, res, next) => {
  const { patientId } = req.params;
  if (
    req.user.role == "Patient" &&
    req.user._id.toString() != patientId.toString()
  )
    return next(
      new Error("You are not allowed to delete these notifications", {
        status: 403,
      })
    );

  const notifications = await notificationModel.deleteMany({ patientId });
  if (notifications.length <= 0)
    return next(
      new Error("This patient has no notifications", { status: 404 })
    );

  return res.status(200).json({ message: "success", notifications });
};
