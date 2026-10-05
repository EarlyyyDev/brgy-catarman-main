import { body } from "express-validator";

export const documentTypeValidator = [
  body("name").isString().trim().notEmpty(),
  body("code").isString().trim().notEmpty(),
  body("description").optional().isString(),
  body("requirements").optional().isArray(),
  body("fee").optional().isFloat({ min: 0 }),
  body("validityDays").optional().isInt({ min: 1 }),
  body("isActive").optional().isBoolean().toBoolean(),
];

export const certificateTemplateValidator = [
  body("name").isString().trim().notEmpty(),
  body("documentTypeId").isUUID(),
  body("bodyHtml").isString().notEmpty(),
  body("status").optional().isIn(["ACTIVE", "INACTIVE"]),
  body("requireResidentPhoto").optional().isBoolean().toBoolean(),
  body("showBarangayLogo").optional().isBoolean().toBoolean(),
  body("showMunicipalLogo").optional().isBoolean().toBoolean(),
  body("showBarangayDrySeal").optional().isBoolean().toBoolean(),
  body("logoSize").optional().isInt({ min: 20, max: 300 }),
];

export const publicCertificateRequestValidator = [
  body("documentTypeId").isUUID(),
  body("requestorName").isString().trim().notEmpty(),
  body("address").isString().trim().notEmpty(),
  body("contactNumber").isString().trim().notEmpty(),
  body("email").isEmail(),
  body("purpose").isString().trim().notEmpty(),
  body("residentId").optional().isUUID(),
];

// Used only for the anonymous online-submission route (not walk-in, where
// staff may be recording a request for someone not yet in the system).
// Requires residentId so every online request must be tied to a real,
// registered resident record -- the name shown on the request is then
// derived server-side from that record, not trusted as free text. Accepts
// multiple document types in one submission, grouped under one shared
// reference number (see CertificateRequestBatch).
export const publicCertificateBatchRequestValidator = [
  body("captchaToken").isString().trim().notEmpty().withMessage("Please complete the captcha verification."),
  body("documentTypeIds").isArray({ min: 1 }).withMessage("Please select at least one document to request."),
  body("documentTypeIds.*").isUUID(),
  body("otherDocumentLabel").optional().isString(),
  body("address").isString().trim().notEmpty(),
  body("contactNumber").isString().trim().notEmpty(),
  body("email").isEmail(),
  body("purpose").isString().trim().notEmpty(),
  body("residentId").isUUID().withMessage("Please select your name from the list of registered residents."),
  body("isRepresentative").optional().isBoolean().toBoolean(),
  body("requestorName").optional().isString().trim(),
  body("requestorName").custom((value, { req }) => {
    if (req.body.isRepresentative && (typeof value !== "string" || !value.trim())) {
      throw new Error("Enter the authorized representative's full name.");
    }
    return true;
  }),
];

export const updateCertificateStatusValidator = [
  body("status").isIn([
    "PENDING",
    "PROCESSING",
    "APPROVED",
    "REJECTED",
    "READY_FOR_CLAIM",
    "CLAIMED",
  ]),
  body("rejectionReason").optional().isString(),
  body("staffNotes").optional().isString(),
  body("extendDays").optional().isInt({ min: 1 }),
  body("claimedBy").optional().isString(),
];
