import connectDB from "../../DB/connection.js";
import { globalErrorHandler } from "../middleware/errorHandling.js";
import authRouter from "./Auth/auth.router.js";
import appointmentRouter from "./Appointment/appointment.router.js";
import userRouter from "./User/user.router.js";
import blogRouter from "./Blog/blog.router.js";
import medicalHistoryRouter from "./MedicalHistory/medicalRecord.router.js";
import paymentRouter from "./Payment/payment.router.js";
import notificationRouter from "./Notifications/notification.router.js";

import cors from "cors";

const initApp = (app, express) => {
  app.use(cors());
  app.use(express.json());
  connectDB();
  app.get("/", (req, res) => {
    return res.status(200).json("Welcome to Our Medical Clinic ^_^");
  });
  app.use("/PDF", express.static("./"));

  app.use("/auth", authRouter);
  app.use("/appointment", appointmentRouter);
  app.use("/user", userRouter);
  app.use("/blog", blogRouter);
  app.use("/medicalHistory", medicalHistoryRouter);
  app.use("/payment", paymentRouter);
  app.use("/notification", notificationRouter);

  app.get("*", (req, res) => {
    return res.status(500).json({ message: "Page Not Found!!" });
  });
  app.use(globalErrorHandler);
};

export default initApp;
