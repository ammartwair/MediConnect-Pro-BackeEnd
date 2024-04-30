import paymentModel from "../../../DB/Model/Payments.Model.js";
import appointmentModel from "../../../DB/Model/Appointment.Model.js";
import patientModel from "../../../DB/Model/Patient.Model.js";
import { Filter } from "../../services/filter.js";
import { pagination } from "../../services/pagination.js";
import { sendEmail } from "../../services/email.js";
import { createPdf } from "../../services/pdf.js";

import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get All the payments
export const getAll = async (req, res, next) => {
  const { skip, limit } = pagination(req.params.page, req.params.limit);

  // Find based on: paymentDate, amount, status, patientId, createdBy
  const queryObject = Filter({ ...req.query });
  const mongooseQuery = await paymentModel
    .find(queryObject)
    .skip(skip)
    .limit(limit);

  // Select one of these:
  // patientId, appointmentId, invoiceNumber, amount, status, paymentDate, createdBy, updatedBy.
  if (req.query.select)
    mongooseQuery.select(req.query.select?.replaceAll(",", " "));

  // Sort based on one of these: amount, paymentDate.
  if (req.query.sort) {
    mongooseQuery.sort(req.query.sort?.replaceAll(",", " "));
  }
  const invoices = mongooseQuery;

  if (invoices.length <= 0)
    return next(new Error("No payments found", { status: 404 }));

  return res.status(200).json({ message: "Success", invoices });
};

// Get a specific payment invoice
export const getOne = async (req, res, next) => {
  const { invoiceId } = req.params;

  const invoice = await paymentModel.findById(invoiceId);
  if (!invoice) return next(new Error("Invoice not found", { status: 404 }));

  if (
    req.user.role == "Patient" &&
    req.user._id.toString() != invoice.patientId.toString()
  )
    return next(new Error("You can't view this invoice", { cause: 409 }));

  return res.status(200).json({ message: "success", invoice });
};

// Get All Payment invoices for a patient
export const getAllForPatient = async (req, res, next) => {
  const { patientId } = req.params;
  const { skip, limit } = pagination(req.params.page, req.params.limit);
  if (
    req.user.role == "Patient" &&
    req.user._id.toString() != patientId.toString()
  )
    return next(
      new Error("You are not allowed to view this patient's invoices", {
        cause: 409,
      })
    );

  const mongooseQuery = await paymentModel
    .find({ patientId })
    .skip(skip)
    .limit(limit);

  // Select one of these:
  // patientId, appointmentId, invoiceNumber, amount, status, paymentDate, createdBy, updatedBy.
  if (req.query.select)
    mongooseQuery.select(req.query.select?.replaceAll(",", " "));

  // Sort based on one of these: amount, paymentDate.
  if (req.query.sort) mongooseQuery.sort(req.query.sort?.replaceAll(",", " "));

  const invoices = mongooseQuery;
  if (invoices.length <= 0)
    return next(new Error("This patient has no invoices yet", { status: 404 }));

  return res.status(200).json({ message: "success", invoices });
};

// Create a new Invoice
export const createInvoice = async (req, res, next) => {
  const { patientId, amount, appointmentId } = req.body;

  const appointment = await appointmentModel.findOne({
    _id: appointmentId,
    patientId,
  });
  if (!appointment)
    return next(
      new Error("This appointment does not exist for this patient", {
        status: 404,
      })
    );

  let invoice = await paymentModel.findOne({ appointmentId });
  if (invoice)
    return next(
      new Error("An invoice already exists for this appointment", {
        status: 409,
      })
    );

  invoice = await paymentModel.create({
    patientId,
    amount,
    appointmentId,
    invoiceNumber: generateInvoiceNumber(),
    status: "unpaid",
    paymentDate: new Date(),
    createdBy: req.user._id,
    updatedBy: req.user._id,
  });

  appointment.invoiceId = invoice._id;
  appointment.save();

  return res
    .status(200)
    .json({ message: "Invoice created successfully", invoice });
};

// Update Invoice Amount
export const updateInvoiceAmount = async (req, res, next) => {
  const invoice = await paymentModel.findByIdAndUpdate(
    { _id: req.params.invoiceId },
    { amount: req.body.amount, updatedBy: req.user._id },
    {
      new: true,
    }
  );
  if (!invoice) return next(new Error("Invoice not found", { status: 404 }));

  return res
    .status(200)
    .json({ message: "Invoice updated successfully", invoice });
};

// Pay an invoice
export const payInvoice = async (req, res, next) => {
  const { invoiceId } = req.params;

  const invoice = await paymentModel.findById(invoiceId);
  if (!invoice) return next(new Error("Invoice not found", { status: 404 }));

  if (req.user._id.toString() != invoice.patientId.toString())
    return next(new Error("This is not your invoice", { status: 403 }));

  if (invoice.status == "cancelled")
    return next(new Error("You Can't paid this invoice", { status: 400 }));

  const appointment = await appointmentModel.findByIdAndUpdate(
    invoice.appointmentId,
    { paymentStatus: "paid" },
    { new: true }
  );

  invoice.status = "paid";
  invoice.paymentDate = new Date();
  invoice.save();

  await sendEmail(
    patient.email,
    "Successful Payment",
    `<p>The payment was completed successfully</p>`
  );

  return res
    .status(200)
    .json({ message: "Payment processed successfully", invoice, appointment });
};

// Delete an Payment Invoice
export const deleteInvoice = async (req, res, next) => {
  const { invoiceId } = req.params;

  const invoice = await paymentModel.findByIdAndDelete(invoiceId);
  if (!invoice) return next(new Error("Invoice not found", { status: 404 }));

  await appointmentModel.findByIdAndUpdate(
    invoice.appointmentId,
    { invoiceId: null },
    { new: true }
  );

  return res.status(200).json({ message: "Invoice deleted", invoice });
};

// Delete all Payment Invoice
export const deleteAll = async (req, res, next) => {
  const invoices = await paymentModel.deleteMany({});
  if (!invoices) return next(new Error("No invoices", { status: 404 }));

  const appointments = await appointmentModel.find();
  for (const appointment of appointments) {
    appointment.invoiceId = null;
    appointment.save();
  }

  return res.status(200).json({ message: "Invoices deleted", invoices });
};

// Delete all Payment Invoice for a Patient
export const deleteAllforPatient = async (req, res, next) => {
  const { patientId } = req.params;

  const invoices = await paymentModel.deleteMany({ patientId });
  if (!invoices) return next(new Error("Invoices not found", { status: 404 }));

  const appointments = await appointmentModel.find({ patientId });
  for (const appointment of appointments) {
    appointment.invoiceId = null;
    appointment.save();
  }

  return res.status(200).json({ message: "Invoice deleted", invoices });
};

// Print an Invoice PDF
export const printInvoice = async (req, res, next) => {
  const { invoiceId } = req.params;

  const invoice = await paymentModel.findById(invoiceId).lean();
  if (!invoice) return next(new Error("Invoice not found", { status: 404 }));

  if (
    req.user.role == "Patient" &&
    req.user._id.toString() != invoice.patientId.toString()
  )
    return next(
      new Error("You are not allowed to view this invoice", { status: 403 })
    );

  const htmlPath = join(__dirname, "../../../templtes/invoicePDF.html");
  await createPdf(invoice, htmlPath, "Payment Invoice.pdf", req, res);
};

// Print all invoices for a patient
export const printAllforPatient = async (req, res, next) => {
  const { patientId } = req.params;

  const patient = await patientModel.findById(patientId);
  if (!patient) return next(new Error("Patient not found", { status: 404 }));
  if (
    req.user.role == "Patient" &&
    patientId.toString() != req.user._id.toString()
  )
    return next(
      new Error("You are not allowed to view this invoices", { status: 403 })
    );

  const invoices = await paymentModel.find({ patientId }).lean();
  if (invoices.length <= 0)
    return next(new Error("This patient has no invoices", { status: 404 }));

  const htmlPath = join(__dirname, "../../../templtes/multiInvoices.html");
  await createPdf(
    invoices,
    htmlPath,
    "Patient's Payment Invoices.pdf",
    req,
    res
  );
};
//patientId status amount createdBy paymentDate

// Print all invoices for a patient
export const printAllInvoices = async (req, res, next) => {
  const invoices = await paymentModel.find().lean();
  if (invoices.length <= 0)
    return next(new Error("No Invoices", { status: 404 }));

  const htmlPath = join(__dirname, "../../../templtes/multiInvoices.html");
  await createPdf(invoices, htmlPath, "Payment Invoices.pdf", req, res);
};

// Helper function
function generateInvoiceNumber() {
  const prefix = "INV";
  const year = new Date().getFullYear();
  const month = (new Date().getMonth() + 1).toString().padStart(2, "0");
  const counter = Math.floor(1000 + Math.random() * 9000);

  return `${prefix}-${year}-${month}-${counter}`;
}
