import jwt from "jsonwebtoken";
import doctorModel from "../../DB/Model/Doctor.Model.js";
import patientModel from "../../DB/Model/Patient.Model.js";

export const roles = {
  Admin: "Admin",
  Doctor: "Doctor",
  Patient: "Patient",
};

export const auth = (accessRoles = []) => {
  return async (req, res, next) => {
    const { authorization } = req.headers;
    if (!authorization?.startsWith(process.env.BEARER_KEY)) {
      return next(new Error("Invalid Authorization", { cause: 400 }));
    }
    const token = authorization.split(process.env.BEARER_KEY)[1];
    const decoded = jwt.verify(token, process.env.LOG_IN_SECRET);
    if (!decoded) {
      return next(new Error("Invalid Authorization", { cause: 400 }));
    }
    let model = null;
    if (decoded.role === "Patient") {
      model = patientModel;
    } else {
      model = doctorModel;
    }
    const user = await model.findById(decoded.id).select("userName role");
    if (!user) {
      return next(new Error("Not Registered User", { cause: 404 }));
    }
    if (!accessRoles.includes(user.role)) {
      return next(new Error("Not Auth User", { cause: 403 }));
    }
    req.user = user;
    next();
  };
};