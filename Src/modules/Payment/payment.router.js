import { Router } from "express";
import * as paymentController from "./payment.controller.js";
import * as validators from "./payment.validation.js";
import { endPoint } from "./payment.endPoint.js";
import { validation } from "../../middleware/validation.js";
import { auth } from "../../middleware/auth.js";
import { asyncHandler } from "../../middleware/errorHandling.js";

const router = new Router();

// Get All the Payment Invoices
router.get(
  "/",
  asyncHandler(auth(endPoint.getAll)),
  validation(validators.getAll),
  asyncHandler(paymentController.getAll)
);

// Get a specific payment invoice
router.get(
  "/getOne/:invoiceId",
  asyncHandler(auth(endPoint.getOne)),
  validation(validators.getOne),
  asyncHandler(paymentController.getOne)
);

// Get All Payment invoices for a patient
router.get(
  "/getAllForPatient/:patientId",
  asyncHandler(auth(endPoint.getAllForPatient)),
  validation(validators.getAllForPatient),
  asyncHandler(paymentController.getAllForPatient)
);

// Create a new payment invoice
router.post(
  "/createInvoice",
  asyncHandler(auth(endPoint.create)),
  validation(validators.create),
  asyncHandler(paymentController.createInvoice)
);

// Update Invoice Amount
router.put(
  "/updateInvoiceAmount/:invoiceId",
  asyncHandler(auth(endPoint.updateInvoice)),
  validation(validators.updateInvoice),
  asyncHandler(paymentController.updateInvoiceAmount)
);

// Pay an Invoice
router.put(
  "/payInvoice/:invoiceId",
  asyncHandler(auth(endPoint.payInvoice)),
  validation(validators.payInvoice),
  asyncHandler(paymentController.payInvoice)
);

// Delete an invoice
router.delete(
  "/deleteInvoice/:invoiceId",
  asyncHandler(auth(endPoint.deleteInvoice)),
  validation(validators.deleteInvoice),
  asyncHandler(paymentController.deleteInvoice)
);

// Delete all invoices
router.delete(
  "/deleteAll",
  asyncHandler(auth(endPoint.deleteAll)),
  asyncHandler(paymentController.deleteAll)
);

// Delete all invoices for a patient
router.delete(
  "/deleteAllforPatient/:patientId",
  asyncHandler(auth(endPoint.deleteAllforPatient)),
  validation(validators.deleteAllforPatient),
  asyncHandler(paymentController.deleteAllforPatient)
);

// Print an Invoice
router.get(
  "/printInvoice/:invoiceId",
  asyncHandler(auth(endPoint.printInvoice)),
  validation(validators.printInvoice),
  asyncHandler(paymentController.printInvoice)
);

// Print All Invoices for a Patient
router.get(
  "/printAllforPatient/:patientId",
  asyncHandler(auth(endPoint.printAllforPatient)),
  validation(validators.printAllforPatient),
  asyncHandler(paymentController.printAllforPatient)
);

// Print All Invoices
router.get(
  "/printAllInvoices",
  asyncHandler(auth(endPoint.printAllInvoices)),
  validation(validators.printAllInvoices),
  asyncHandler(paymentController.printAllInvoices)
);

export default router;
