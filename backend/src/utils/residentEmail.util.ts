import { format } from "date-fns";
import { sendEmail } from "./mailer.util";

function titleCase(value: string): string {
  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

const currencyFormatter = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" });

function formatCurrency(value: number | string): string {
  const amount = typeof value === "string" ? Number(value) : value;
  return currencyFormatter.format(Number.isFinite(amount) ? amount : 0);
}

/** Shared letterhead-style shell -- a navy header band with the barangay
 * name, a bordered card for the message body, and a muted footer note. */
function wrapper(title: string, bodyHtml: string): string {
  return `
    <div style="font-family: Arial, Helvetica, sans-serif; max-width: 520px; margin: 0 auto; color: #1f2937; background: #ffffff;">
      <div style="background: #0B2C5F; padding: 20px 24px; border-radius: 10px 10px 0 0;">
        <p style="margin: 0; font-size: 10px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; color: #c9a227;">Barangay Catarman</p>
        <p style="margin: 4px 0 0; font-size: 17px; font-weight: bold; color: #ffffff;">${title}</p>
      </div>
      <div style="border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px; padding: 24px; line-height: 1.6;">
        ${bodyHtml}
      </div>
      <p style="margin-top: 20px; font-size: 11px; color: #9ca3af; text-align: center;">
        This is an automated message from the Barangay Catarman Online Services Portal. Please do not reply directly to this email.
      </p>
    </div>
  `;
}

/** Itemized document/fee table with a total row -- used wherever a
 * confirmation email needs to show what's being charged for a request. */
function feeTable(items: { name: string; fee: number | string }[]): string {
  const rows = items
    .map(
      (item) => `
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; font-size: 14px; color: #1f2937;">${item.name}</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; font-size: 14px; color: #1f2937; text-align: right; white-space: nowrap;">${formatCurrency(item.fee)}</td>
        </tr>
      `,
    )
    .join("");

  const total = items.reduce((sum, item) => sum + (typeof item.fee === "string" ? Number(item.fee) : item.fee), 0);

  return `
    <table style="width: 100%; border-collapse: collapse; margin: 4px 0 18px;">
      <thead>
        <tr>
          <th style="text-align: left; padding: 0 0 8px; border-bottom: 2px solid #0B2C5F; font-size: 11px; font-weight: bold; letter-spacing: 0.5px; text-transform: uppercase; color: #6b7280;">Document</th>
          <th style="text-align: right; padding: 0 0 8px; border-bottom: 2px solid #0B2C5F; font-size: 11px; font-weight: bold; letter-spacing: 0.5px; text-transform: uppercase; color: #6b7280;">Fee</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
      <tfoot>
        <tr>
          <td style="padding: 14px 0 0; font-size: 15px; font-weight: bold; color: #0B2C5F;">Total Amount Due</td>
          <td style="padding: 14px 0 0; font-size: 15px; font-weight: bold; color: #0B2C5F; text-align: right; white-space: nowrap;">${formatCurrency(total)}</td>
        </tr>
      </tfoot>
    </table>
    <p style="margin: 0 0 18px; font-size: 12px; color: #6b7280;">Payable in person at the Barangay Hall when you claim your document(s).</p>
  `;
}

export async function sendCertificateSubmittedEmail(params: {
  email: string;
  requestorName: string;
  referenceNumber: string;
  documentTypeName: string;
  fee: number | string;
}) {
  const { email, requestorName, referenceNumber, documentTypeName, fee } = params;
  await sendEmail(
    email,
    `Document Request Received — ${referenceNumber}`,
    wrapper(
      "Request Received",
      `
        <p>Dear ${requestorName},</p>
        <p>Thank you for your request. We have received your application for the document listed below, and it is now being processed by our office.</p>
        ${feeTable([{ name: documentTypeName, fee }])}
        <p style="margin: 0 0 6px; font-size: 12px; font-weight: bold; letter-spacing: 0.5px; text-transform: uppercase; color: #6b7280;">Reference Number</p>
        <p style="font-size: 20px; font-weight: bold; letter-spacing: 1px; background: #f3f4f6; padding: 12px 16px; border-radius: 8px; text-align: center; color: #0B2C5F;">${referenceNumber}</p>
        <p style="margin-top: 18px;">Please keep this reference number for tracking your request. We will notify you by email as soon as its status changes.</p>
        <p style="margin-bottom: 0;">Thank you for transacting with Barangay Catarman.</p>
      `,
    ),
  );
}

export async function sendCertificateBatchSubmittedEmail(params: {
  email: string;
  requestorName: string;
  referenceNumber: string;
  documents: { name: string; fee: number | string }[];
}) {
  const { email, requestorName, referenceNumber, documents } = params;
  await sendEmail(
    email,
    `Document Request Received — ${referenceNumber}`,
    wrapper(
      "Request Received",
      `
        <p>Dear ${requestorName},</p>
        <p>Thank you for your request. We have received your application for the document${documents.length > 1 ? "s" : ""} listed below, and ${documents.length > 1 ? "they are" : "it is"} now being processed by our office.</p>
        ${feeTable(documents)}
        <p style="margin: 0 0 6px; font-size: 12px; font-weight: bold; letter-spacing: 0.5px; text-transform: uppercase; color: #6b7280;">Reference Number</p>
        <p style="font-size: 20px; font-weight: bold; letter-spacing: 1px; background: #f3f4f6; padding: 12px 16px; border-radius: 8px; text-align: center; color: #0B2C5F;">${referenceNumber}</p>
        <p style="margin-top: 18px;">Please keep this reference number to track ${documents.length > 1 ? "all of these requests together" : "your request"}. We will notify you by email as soon as ${documents.length > 1 ? "any of their statuses change" : "its status changes"}.</p>
        <p style="margin-bottom: 0;">Thank you for transacting with Barangay Catarman.</p>
      `,
    ),
  );
}

export async function sendCertificateStatusEmail(params: {
  email: string;
  requestorName: string;
  referenceNumber: string;
  documentTypeName: string;
  status: string;
  fee?: number | string | null;
  claimDeadline?: Date | null;
  rejectionReason?: string | null;
}) {
  const { email, requestorName, referenceNumber, documentTypeName, status, fee, claimDeadline, rejectionReason } = params;
  const statusLabel = titleCase(status);

  let extra = "";
  if (status === "READY_FOR_CLAIM") {
    extra = `
      <p>Your document is ready for pickup at the Barangay Hall${claimDeadline ? ` on or before <strong>${format(claimDeadline, "MMMM d, yyyy")}</strong>` : ""}. Please bring a valid ID and this reference number.</p>
      ${fee !== undefined && fee !== null ? `<p style="margin: 12px 0 0; padding: 12px 16px; background: #f3f4f6; border-radius: 8px; font-size: 14px;">Amount due upon claiming: <strong style="color: #0B2C5F;">${formatCurrency(fee)}</strong></p>` : ""}
    `;
  } else if (status === "REJECTED" && rejectionReason) {
    extra = `<p style="margin: 0; padding: 12px 16px; background: #fef2f2; border-radius: 8px; color: #991b1b;"><strong>Reason:</strong> ${rejectionReason}</p>`;
  }

  await sendEmail(
    email,
    `Update on Your Document Request — ${referenceNumber}`,
    wrapper(
      "Request Status Updated",
      `
        <p>Dear ${requestorName},</p>
        <p>Your request for a <strong>${documentTypeName}</strong> (reference <strong>${referenceNumber}</strong>) has been updated to:</p>
        <p style="font-size: 18px; font-weight: bold; color: #0B2C5F; margin: 4px 0 16px;">${statusLabel}</p>
        ${extra}
        <p style="margin-top: 18px; margin-bottom: 0;">Thank you for transacting with Barangay Catarman.</p>
      `,
    ),
  );
}

export async function sendComplaintSubmittedEmail(params: {
  email: string;
  reporterName: string;
  referenceNumber: string;
}) {
  const { email, reporterName, referenceNumber } = params;
  await sendEmail(
    email,
    `Incident Report Received — ${referenceNumber}`,
    wrapper(
      "Report Received",
      `
        <p>Hi ${reporterName},</p>
        <p>We've received your incident report. Your identity remains confidential and is only visible to authorized barangay staff.</p>
        <p style="font-size: 20px; font-weight: bold; letter-spacing: 1px; background: #f3f4f6; padding: 12px 16px; border-radius: 8px; text-align: center;">${referenceNumber}</p>
        <p>We'll email you again whenever your report's status changes.</p>
      `,
    ),
  );
}

export async function sendComplaintStatusEmail(params: {
  email: string;
  reporterName: string;
  referenceNumber: string;
  status: string;
}) {
  const { email, reporterName, referenceNumber, status } = params;
  const statusLabel = titleCase(status);

  await sendEmail(
    email,
    `Update on Your Incident Report — ${referenceNumber}`,
    wrapper(
      "Report Status Updated",
      `
        <p>Hi ${reporterName},</p>
        <p>Your incident report (reference <strong>${referenceNumber}</strong>) is now:</p>
        <p style="font-size: 18px; font-weight: bold; color: #0B2C5F;">${statusLabel}</p>
      `,
    ),
  );
}
