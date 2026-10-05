export function getDefaultBlotterTemplateBodyHtml(): string {
  return `
    <div style="display:flex; align-items:center; justify-content:space-between; border-bottom:4px double #C9A227; padding-bottom:16px;">
      <div style="display:flex; align-items:center; gap:16px;">
        <div>{{barangay_logo}}</div>
        <div>
          <p style="margin:0; font-size:11px;">Republic of the Philippines</p>
          <p style="margin:0; font-size:11px;">Province of {{province}}</p>
          <p style="margin:0; font-size:11px;">{{municipality}}</p>
          <p style="margin:4px 0 0; font-weight:700; font-size:16px;">OFFICE OF THE LUPONG TAGAPAMAYAPA</p>
        </div>
      </div>
      <div style="text-align:right; font-size:11px;">
        <p style="margin:0; font-weight:600;">Case No.</p>
        <p style="margin:0; font-weight:700; font-size:16px; color:#0B2C5F;">{{case_number}}</p>
      </div>
    </div>

    <div style="margin-top:28px; text-align:center;">
      <p style="margin:0; font-size:22px; font-weight:800; text-transform:uppercase; letter-spacing:0.05em;">Katarungang Pambarangay Blotter Report</p>
      <p style="margin:4px 0 0; font-size:13px; color:#5B6B85;">{{incident_type}}</p>
    </div>

    <div style="margin-top:28px; display:grid; grid-template-columns:1fr 1fr; gap:20px; font-size:13px;">
      <div>
        <p style="margin:0; font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.04em; color:#5B6B85;">Complainant</p>
        <p style="margin:4px 0 0; font-weight:600;">{{complainant_name}}</p>
        <p style="margin:0;">{{complainant_address}}</p>
        <p style="margin:0;">{{complainant_contact}}</p>
      </div>
      <div>
        <p style="margin:0; font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.04em; color:#5B6B85;">Respondent</p>
        <p style="margin:4px 0 0; font-weight:600;">{{respondent_name}}</p>
        <p style="margin:0;">{{respondent_address}}</p>
      </div>
      <div>
        <p style="margin:0; font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.04em; color:#5B6B85;">Date of Incident</p>
        <p style="margin:4px 0 0;">{{incident_date}}</p>
      </div>
      <div>
        <p style="margin:0; font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.04em; color:#5B6B85;">Location</p>
        <p style="margin:4px 0 0;">{{location}}</p>
      </div>
    </div>

    <div style="margin-top:28px;">
      <p style="margin:0; font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.04em; color:#5B6B85;">Narrative of Complaint</p>
      <p style="margin:8px 0 0; text-align:justify; line-height:1.9;">{{narrative}}</p>
    </div>

    <div style="margin-top:24px;">
      <p style="margin:0; font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.04em; color:#5B6B85;">Hearing Schedule</p>
      <div style="margin-top:8px; font-size:13px;">{{hearing_schedule}}</div>
    </div>

    <div style="margin-top:24px;">
      <p style="margin:0; font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.04em; color:#5B6B85;">Resolution</p>
      <p style="margin:8px 0 0; text-align:justify; line-height:1.9;">{{resolution}}</p>
    </div>

    <div style="margin-top:64px; display:flex; align-items:flex-end; justify-content:center; gap:40px;">
      <div style="text-align:center;">{{barangay_seal}}</div>
      <div style="text-align:center;">{{mediator_signature}}</div>
    </div>
  `.trim()
}
