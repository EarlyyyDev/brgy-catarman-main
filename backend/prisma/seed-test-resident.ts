import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const testResident = {
  firstName: "Demo",
  middleName: "Test",
  lastName: "Resident",
  gender: "MALE" as const,
  birthdate: new Date("1990-01-01T00:00:00.000Z"),
  civilStatus: "SINGLE" as const,
  street: "TEST RECORD - DO NOT CONTACT",
  houseNumber: "0",
  contactNumber: "0000000000",
  isRegisteredVoter: false,
};

async function main() {
  const existing = await prisma.resident.findFirst({
    where: {
      firstName: testResident.firstName,
      lastName: testResident.lastName,
      contactNumber: testResident.contactNumber,
      deletedAt: null,
    },
    select: { id: true },
  });

  if (existing) {
    console.log(`Test resident already exists (${existing.id}).`);
    return;
  }

  const purok = await prisma.purok.findFirst({
    where: { name: "Purok 1 - Poblacion" },
    select: { id: true },
  });

  if (!purok) {
    throw new Error("Purok 1 - Poblacion is missing. Run the regular Prisma seed first.");
  }

  const resident = await prisma.resident.create({
    data: { ...testResident, purokId: purok.id },
    select: { id: true, firstName: true, lastName: true, contactNumber: true },
  });

  console.log(`Created test resident ${resident.firstName} ${resident.lastName} (${resident.id}).`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });