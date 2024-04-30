import joi from "joi";
import { generalFields } from "../../middleware/validation.js";

export const getAll = joi.object({
  page: joi.number().min(1),
  limit: joi.number().min(1).max(10),
  sort: joi.string().valid("amount", "paymentDate"),
  select: joi
    .object()
    .valid(
      "patientId",
      "appointmentId",
      "invoiceNumber",
      "amount",
      "status",
      "paymentDate",
      "createdBy",
      "updatedBy"
    ),
  paymentDate: joi.object(),
  amount: joi.object(),
  status: joi.string().valid("paid", "unpaid", "failed", "cancelled"),
  patientId: generalFields.id,
  createdBy: generalFields.id,
});

export const getOne = joi.object({
  invoiceId: generalFields.id.required(),
});

export const getAllForPatient = joi.object({
  patientId: generalFields.id.required(),
  page: joi.number().min(1),
  limit: joi.number().min(1).max(10),
  sort: joi.string().valid("amount", "paymentDate"),
  select: joi
    .string()
    .valid(
      "patientId",
      "appointmentId",
      "invoiceNumber",
      "amount",
      "status",
      "paymentDate",
      "createdBy",
      "updatedBy"
    ),
});

export const create = joi.object({
  patientId: generalFields.id.required(),
  amount: joi.number().min(50).required(),
  appointmentId: generalFields.id.required(),
});

export const updateInvoice = joi.object({
  invoiceId: generalFields.id.required(),
  amount: joi.number().min(50),
});

export const payInvoice = joi.object({
  invoiceId: generalFields.id.required(),
});

export const deleteInvoice = joi.object({
  invoiceId: generalFields.id.required(),
});

export const deleteAllforPatient = joi.object({
  patientId: generalFields.id.required(),
});

export const printInvoice = joi.object({
  invoiceId: generalFields.id.required(),
});

export const printAllforPatient = joi.object({
  patientId: generalFields.id.required(),
});

export const printAllInvoices = joi.object({
  patientId: generalFields.id,
  status: joi.string().valid("paid", "unpaid", "cancelled", "failed"),
  amount: joi.object(),
  createdBy: generalFields.id,
  paymentDate: joi.object(),
});
