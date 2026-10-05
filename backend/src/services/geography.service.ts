import { Request } from "express";
import { Prisma } from "@prisma/client";
import { geographyRepository } from "../repositories/geography.repository";
import { ApiError } from "../utils/apiError.util";
import { activityLogService } from "./activityLog.service";

const DEFAULT_PUROK_NAME = "Purok 1";

function listSitios() {
  return geographyRepository.listSitios();
}

async function addSitio(name: string, req: Request) {
  const trimmed = name.trim();
  const existing = await geographyRepository.findSitioByName(trimmed);
  if (existing) {
    throw ApiError.conflict("A sitio with this name already exists");
  }

  const sitio = await geographyRepository.createSitio(trimmed);
  await geographyRepository.createPurok(sitio.id, DEFAULT_PUROK_NAME);

  await activityLogService.log({ req, action: "Added new sitio", module: "SETTINGS", description: trimmed });
  return geographyRepository.listSitios().then((sitios) => sitios.find((s) => s.id === sitio.id));
}

async function renameSitio(id: string, name: string, req: Request) {
  const sitio = await geographyRepository.updateSitio(id, name.trim());
  await activityLogService.log({ req, action: "Renamed sitio", module: "SETTINGS", description: sitio.name });
  return sitio;
}

async function deleteSitio(id: string, req: Request) {
  // Purok.sitio is an onDelete: Cascade relation, so Postgres would happily
  // delete a sitio and silently wipe out any (even empty-looking) puroks
  // under it without ever raising a constraint error -- the P2003 catch
  // below never actually fires for this case. Checking explicitly here is
  // the only way to make "cannot delete a sitio that still has puroks" a
  // real guarantee instead of a comment that doesn't match DB behavior.
  const purokCount = await geographyRepository.countPuroksInSitio(id);
  if (purokCount > 0) {
    throw ApiError.conflict("Cannot delete a sitio that still has puroks. Delete or move its puroks first.");
  }

  try {
    await geographyRepository.deleteSitio(id);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      throw ApiError.notFound("Sitio not found");
    }
    // P2003 covers Prisma-recognized FK violations; PrismaClientUnknownRequestError
    // is what Postgres' raw RESTRICT constraint (code 23001) actually surfaces as
    // here -- both mean the same thing (something still references this sitio), so
    // both must produce the same clean conflict instead of an unhandled 500.
    if (
      (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2003") ||
      err instanceof Prisma.PrismaClientUnknownRequestError
    ) {
      throw ApiError.conflict("Cannot delete a sitio that still has puroks, residents, or households");
    }
    throw err;
  }
  await activityLogService.log({ req, action: "Deleted sitio", module: "SETTINGS" });
}

async function addPurok(sitioId: string, name: string, req: Request) {
  const purok = await geographyRepository.createPurok(sitioId, name.trim());
  await activityLogService.log({ req, action: "Added new purok", module: "SETTINGS", description: purok.name });
  return purok;
}

async function renamePurok(id: string, name: string, req: Request) {
  const purok = await geographyRepository.updatePurok(id, name.trim());
  await activityLogService.log({ req, action: "Renamed purok", module: "SETTINGS", description: purok.name });
  return purok;
}

async function deletePurok(id: string, req: Request) {
  const [residentCount, householdCount] = await Promise.all([
    geographyRepository.countResidentsInPurok(id),
    geographyRepository.countHouseholdsInPurok(id),
  ]);
  if (residentCount > 0 || householdCount > 0) {
    throw ApiError.conflict("Cannot delete a purok that still has residents or households");
  }

  try {
    await geographyRepository.deletePurok(id);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      throw ApiError.notFound("Purok not found");
    }
    if (
      (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2003") ||
      err instanceof Prisma.PrismaClientUnknownRequestError
    ) {
      throw ApiError.conflict("Cannot delete a purok that still has residents or households");
    }
    throw err;
  }
  await activityLogService.log({ req, action: "Deleted purok", module: "SETTINGS" });
}

export const geographyService = { listSitios, addSitio, renameSitio, deleteSitio, addPurok, renamePurok, deletePurok };
