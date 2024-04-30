import appointmentModel from "../../../DB/Model/Appointment.Model.js";
import reviewModel from "../../../DB/Model/Review.Model.js";

export const create = async (req, res, next) => {
  const { appointmentId } = req.params;
  const { comment, rating } = req.body;

  const appointment = await appointmentModel.findOne({
    _id: appointmentId,
    patientId: req.user.id,
    status: "complete",
  });
  if (!appointment) {
    return next(new Error("Can't Review this appointment", { status: 400 }));
  }

  const checked = await reviewModel.findOne({
    appointmentId: appointmentId,
    createdBy: req.user.id,
  });
  if (checked) {
    return next(new Error("Already Reviewed", { status: 400 }));
  }

  const review = await reviewModel.create({
    comment,
    rating,
    createdBy: req.user.id,
    appointmentId: appointmentId,
  });
  if (!review) {
    return next(new Error("Error while adding review", { status: 400 }));
  }

  return res.status(201).json({ message: "success review", review });
};
