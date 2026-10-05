import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/utils/hash.util";
import { env } from "../src/config/env";

const prisma = new PrismaClient();

// Structural/reference data only — reconciles the two incompatible Purok
// representations found in the frontend prototype (a closed 6-value string
// enum on Resident.address vs. a 3x3 Sitio/Purok hierarchy hand-written for
// Households) by using the relational hierarchy as canonical, grouping the
// six Purok names the frontend's own type system already establishes under
// a single Sitio. This is not resident/household data — no records
// reference these until a real resident/household is created.
const PUROK_NAMES = [
  "Purok 1 - Poblacion",
  "Purok 2 - Riverside",
  "Purok 3 - Mabuhay",
  "Purok 4 - San Isidro",
  "Purok 5 - Maligaya",
  "Purok 6 - Bagong Silang",
];

const DOCUMENT_TYPES = [
  {
    name: "Barangay Certificate",
    code: "BARANGAY_CERTIFICATE",
    description: "General-purpose certificate attesting residency/good standing.",
    requirements: ["Purok Certification", "Proof of Residency"],
    fee: 50,
    validityDays: 180,
  },
  {
    name: "Barangay Clearance",
    code: "BARANGAY_CLEARANCE",
    description: "Clearance commonly required for employment or business permits.",
    requirements: ["Purok Certification", "Cedula"],
    fee: 50,
    validityDays: 180,
  },
  {
    name: "Certificate of Residency",
    code: "CERTIFICATE_OF_RESIDENCY",
    description: "Attests that the requester resides within the barangay.",
    requirements: ["Purok Certification", "Proof of Residency"],
    fee: 50,
    validityDays: 180,
  },
  {
    name: "Certificate of Indigency",
    code: "CERTIFICATE_OF_INDIGENCY",
    description: "Attests to indigent status, typically for financial/medical assistance applications.",
    requirements: ["Purok Certification"],
    fee: 0,
    validityDays: 90,
  },
  {
    name: "Business Clearance",
    code: "BUSINESS_CLEARANCE",
    description: "Clearance required before securing a business permit.",
    requirements: ["Purok Certification", "DTI/SEC Registration", "Lease Contract or Land Title"],
    fee: 200,
    validityDays: 365,
  },
  {
    name: "Other Barangay Document",
    code: "OTHER_BARANGAY_DOCUMENT",
    description: "Catch-all for barangay documents not covered by a specific type.",
    requirements: ["Purok Certification"],
    fee: 50,
    validityDays: 180,
  },
  {
    name: "Certificate of Good Moral Character",
    code: "CERTIFICATE_OF_GOOD_MORAL_CHARACTER",
    description: "Attests to the requester's good standing and moral conduct in the community.",
    requirements: ["Purok Certification", "Proof of Residency"],
    fee: 50,
    validityDays: 180,
  },
  {
    name: "Senior Citizen Certificate",
    code: "SENIOR_CITIZEN_CERTIFICATE",
    description: "Certifies the requester's status as a senior citizen resident of the barangay.",
    requirements: ["Purok Certification", "Senior Citizen ID or Birth Certificate"],
    fee: 0,
    validityDays: 365,
  },
  {
    name: "Solo Parent Certificate",
    code: "SOLO_PARENT_CERTIFICATE",
    description: "Certifies the requester's status as a solo parent resident of the barangay.",
    requirements: ["Purok Certification", "Proof of Solo Parent Status"],
    fee: 0,
    validityDays: 365,
  },
];

function defaultCertificateBody(name: string): string {
  return `<p>TO WHOM IT MAY CONCERN:</p>
<p>This is to certify that <strong>{{residentName}}</strong>, of legal age, is a resident of {{address}}, Barangay Catarman.</p>
<p>This ${name} is being issued upon the request of the above-named person for <strong>{{purpose}}</strong>.</p>
<p>Issued this {{issuedDate}} at Barangay Catarman.</p>`;
}

const BLOTTER_TEMPLATE_BODY = `<p>BARANGAY CATARMAN</p>
<p>BLOTTER REPORT</p>
<p>Case No.: {{caseNumber}}</p>
<p>Complainant: {{complainantName}}</p>
<p>Respondent: {{respondentName}}</p>
<p>Narrative:</p>
<p>{{narrative}}</p>`;

async function main() {
  console.log("Seeding geography (Sitio/Purok)...");
  const sitio = await prisma.sitio.upsert({
    where: { name: "Barangay Catarman" },
    create: { name: "Barangay Catarman" },
    update: {},
  });

  for (const name of PUROK_NAMES) {
    await prisma.purok.upsert({
      where: { sitioId_name: { sitioId: sitio.id, name } },
      create: { sitioId: sitio.id, name },
      update: {},
    });
  }

  console.log("Seeding document types...");
  const documentTypeRecords = [];
  for (const docType of DOCUMENT_TYPES) {
    const record = await prisma.documentType.upsert({
      where: { code: docType.code },
      create: docType,
      update: { requirements: docType.requirements },
    });
    documentTypeRecords.push(record);
  }

  console.log("Seeding default certificate templates...");
  for (const docType of documentTypeRecords) {
    const existing = await prisma.certificateTemplate.findFirst({
      where: { documentTypeId: docType.id },
    });
    if (!existing) {
      await prisma.certificateTemplate.create({
        data: {
          name: `${docType.name} (Default)`,
          documentTypeId: docType.id,
          status: "ACTIVE",
          requireResidentPhoto: false,
          showBarangayLogo: true,
          showMunicipalLogo: false,
          showBarangayDrySeal: true,
          logoSize: 80,
          bodyHtml: defaultCertificateBody(docType.name),
        },
      });
    }
  }

  console.log("Seeding default blotter template...");
  const existingBlotterTemplate = await prisma.blotterTemplate.findFirst({
    where: { name: "Standard Blotter Report" },
  });
  if (!existingBlotterTemplate) {
    await prisma.blotterTemplate.create({
      data: {
        name: "Standard Blotter Report",
        status: "ACTIVE",
        showBarangayLogo: true,
        showMunicipalLogo: false,
        showBarangayDrySeal: true,
        logoSize: 80,
        bodyHtml: BLOTTER_TEMPLATE_BODY,
      },
    });
  }

  console.log("Seeding default system settings...");
  await prisma.systemSettings.upsert({
    where: { id: "default" },
    create: { id: "default", barangayName: "Barangay Catarman" },
    update: {},
  });

  console.log("Seeding administrator account...");
  const existingAdmin = await prisma.user.findUnique({ where: { email: env.SEED_ADMIN_EMAIL } });
  if (!existingAdmin) {
    const passwordHash = await hashPassword(env.SEED_ADMIN_PASSWORD);
    await prisma.user.create({
      data: {
        name: env.SEED_ADMIN_NAME,
        email: env.SEED_ADMIN_EMAIL,
        passwordHash,
        role: "ADMINISTRATOR",
        position: "System Administrator",
        status: "ACTIVE",
        mustChangePassword: true,
      },
    });
    console.log(`Created administrator account: ${env.SEED_ADMIN_EMAIL}`);
  } else {
    console.log(`Administrator account already exists: ${env.SEED_ADMIN_EMAIL}`);
  }

  console.log(
    "Seed complete. No resident, household, certificate, complaint, blotter, announcement, or official data was created.",
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
