import appointmentModel from "../../../DB/Model/Appointment.Model.js";
import reviewModel from "../../../DB/Model/Review.Model.js";

export const create = async (req, res, next) => {
  const { appointmentId } = req.params;
  const { comment, rating } = req.body;

  const appointment = await appointmentModel.findOneAndUpdate({
    _id: appointmentId,
    patientId: req.user.id,
    status: "completed"
  },
    { status: "completed and reviewed" },
    { new: true }
  );
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



// Get Appointment Review
export const getAppointmentReview = async (req, res, next) => {
  //  const { skip, limit } = pagination(req.query.page, req.query.limit);
  //const { skip } = pagination(req.query.page);

  const review = await reviewModel
    .findOne({
      appointmentId: req.params.appointmentId
    })
    .select("appointmentId comment rating")
  // .populate("review")
  // .skip(skip);
  //.limit(limit);
  console.log(req.params);

  if (!review) {
    return next({ message: "Review not found", status: 404 });
  }

  return res.status(200).json({ message: "Success", review });
};