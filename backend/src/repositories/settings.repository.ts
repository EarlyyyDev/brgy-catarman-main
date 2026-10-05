import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";

const SETTINGS_ID = "default";

export const settingsRepository = {
  get() {
    return prisma.systemSettings.findUnique({ where: { id: SETTINGS_ID } });
  },

  upsert(data: Omit<Prisma.SystemSettingsUncheckedCreateInput, "id">) {
    return prisma.systemSettings.upsert({
      where: { id: SETTINGS_ID },
      create: { id: SETTINGS_ID, ...data },
      update: data,
    });
  },
};
