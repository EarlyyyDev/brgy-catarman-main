import { prisma } from "../config/prisma";

export const geographyRepository = {
  listSitios() {
    return prisma.sitio.findMany({
      include: { puroks: { orderBy: { name: "asc" } } },
      orderBy: { name: "asc" },
    });
  },

  findSitioByName(name: string) {
    return prisma.sitio.findUnique({ where: { name } });
  },

  createSitio(name: string) {
    return prisma.sitio.create({ data: { name } });
  },

  updateSitio(id: string, name: string) {
    return prisma.sitio.update({ where: { id }, data: { name } });
  },

  deleteSitio(id: string) {
    return prisma.sitio.delete({ where: { id } });
  },

  countPuroksInSitio(sitioId: string) {
    return prisma.purok.count({ where: { sitioId } });
  },

  findPurokById(id: string) {
    return prisma.purok.findUnique({ where: { id } });
  },

  createPurok(sitioId: string, name: string) {
    return prisma.purok.create({ data: { sitioId, name } });
  },

  updatePurok(id: string, name: string) {
    return prisma.purok.update({ where: { id }, data: { name } });
  },

  deletePurok(id: string) {
    return prisma.purok.delete({ where: { id } });
  },

  // Deliberately NOT filtering by deletedAt here -- soft-deleted rows still
  // physically exist and still hold their purokId foreign key, so Postgres'
  // real RESTRICT constraint blocks the delete regardless of that flag.
  // The count must match what the DB will actually enforce, or this check
  // gives a false "safe to delete" and the real delete crashes instead.
  countResidentsInPurok(purokId: string) {
    return prisma.resident.count({ where: { purokId } });
  },

  countHouseholdsInPurok(purokId: string) {
    return prisma.household.count({ where: { purokId } });
  },
};
