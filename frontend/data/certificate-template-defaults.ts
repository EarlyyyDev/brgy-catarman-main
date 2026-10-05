import type { CertificateTemplateType } from "@/types"

const BODY_TEXT: Record<CertificateTemplateType, string> = {
  "Certificate of Residency": "is a bona fide resident of this barangay.",
  "Certificate of Indigency": "belongs to an indigent family of this barangay and is qualified to avail of assistance requiring proof of indigency.",
  "Barangay Clearance": "has no derogatory record on file in this barangay as of the date of this certification.",
  "Business Clearance": "is hereby granted clearance to operate a business within the jurisdiction of this barangay.",
  "Certificate of Good Moral Character": "is known to this office to be a person of good moral character and has no derogatory record on file.",
  "Senior Citizen Certificate": "is a registered senior citizen of this barangay and is entitled to the privileges and benefits accorded under the law.",
  "Solo Parent Certificate": "is a registered solo parent of this barangay and is entitled to the privileges and benefits accorded under the law.",
  Others: "is a bona fide resident of this barangay in good standing.",
}

export function getDefaultCertificateTitle(type: CertificateTemplateType): string {
  return type === "Others" ? "BARANGAY CERTIFICATION" : type.toUpperCase()
}

export function getDefaultTemplateBodyHtml(type: CertificateTemplateType): string {
  const title = getDefaultCertificateTitle(type)
  const bodyText = BODY_TEXT[type]

  return `
    <div style="text-align:center; margin-bottom:20px;">
      <h1 style="margin:0; font-size:20px; font-weight:700; letter-spacing:2px; text-transform:uppercase;">${title}</h1>
      <div style="width:100px; height:2px; background:#0F172A; margin:10px auto 0;"></div>
    </div>
    <p style="margin:0 0 16px;">TO WHOM IT MAY CONCERN:</p>
    <p style="text-align:justify; text-indent:40px; line-height:1.9;">
      This is to certify that <strong>{{resident_full_name}}</strong>, of legal age, {{civil_status}}, currently residing at
      {{address}}, {{barangay}}, {{municipality}}, {{province}}, ${bodyText}
    </p>
    <p style="text-align:justify; text-indent:40px; line-height:1.9;">
      This certification is issued upon the request of the above-named person for whatever legal purpose it may serve, particularly for
      <strong>{{purpose}}</strong>.
    </p>
    <p style="text-align:justify; text-indent:40px; line-height:1.9;">
      Issued this {{date_issued}} at {{barangay}}, {{municipality}}, {{province}}.
    </p>
    <p style="margin-top:24px; font-size:12px;">Reference No.: {{reference_number}}</p>
    <div style="margin-top:56px; display:flex; align-items:flex-end; justify-content:center;">
      <div style="text-align:center;">{{captain_signature}}</div>
    </div>
  `.trim()
}
