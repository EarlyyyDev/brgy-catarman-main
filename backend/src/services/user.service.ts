import { Request } from "express";
import { userRepository } from "../repositories/user.repository";
import { hashPassword } from "../utils/hash.util";
import { generateRawToken } from "../utils/token.util";
import { ApiError } from "../utils/apiError.util";
import { activityLogService } from "./activityLog.service";
import { authService } from "./auth.service";
import { parsePagination, toPaginationResult } from "../utils/pagination.util";

async function list(
  req: Request,
  params: { role?: "STAFF" | "ADMINISTRATOR"; status?: "ACTIVE" | "DISABLED"; search?: string },
) {
  const pagination = parsePagination(req);
  const [users, total] = await Promise.all([
    userRepository.list({ ...params, skip: pagination.skip, take: pagination.take }),
    userRepository.count(params),
  ]);
  return toPaginationResult(users.map(authService.toPublicUser), total, pagination);
}

async function getById(id: string) {
  const user = await userRepository.findById(id);
  if (!user) {
    throw ApiError.notFound("Staff account not found");
  }
  return authService.toPublicUser(user);
}

/**
 * Returns the plaintext temporary password in the response (once) since
 * there is no email service in this build to deliver it out-of-band — the
 * administrator relays it to the new staff member directly. Never stored or
 * logged in plaintext anywhere.
 */
async function create(params: {
  name: string;
  email: string;
  role: "STAFF" | "ADMINISTRATOR";
  position: string;
  contactNumber?: string;
  req: Request;
}) {
  const { name, email, role, position, contactNumber, req } = params;

  const existing = await userRepository.findByEmail(email);
  if (existing) {
    throw ApiError.conflict("A staff account with this email already exists");
  }

  const temporaryPassword = generateRawToken(6);
  const passwordHash = await hashPassword(temporaryPassword);

  const user = await userRepository.create({
    name,
    email,
    passwordHash,
    role,
    position,
    contactNumber,
    mustChangePassword: true,
  });

  await activityLogService.log({
    req,
    action: "Added new staff account",
    module: "STAFF",
    description: `Created ${role} account for ${email}`,
  });

  return { user: authService.toPublicUser(user), temporaryPassword };
}

async function update(
  id: string,
  data: Partial<{
    name: string;
    email: string;
    role: "STAFF" | "ADMINISTRATOR";
    position: string;
    contactNumber: string;
  }>,
  req: Request,
) {
  const existing = await userRepository.findById(id);
  if (!existing) {
    throw ApiError.notFound("Staff account not found");
  }

  if (data.email && data.email !== existing.email) {
    const emailTaken = await userRepository.findByEmail(data.email);
    if (emailTaken) {
      throw ApiError.conflict("A staff account with this email already exists");
    }
  }

  const user = await userRepository.update(id, data);
  await activityLogService.log({ req, action: "Updated staff account", module: "STAFF", description: user.email });
  return authService.toPublicUser(user);
}

async function toggleStatus(id: string, req: Request) {
  const existing = await userRepository.findById(id);
  if (!existing) {
    throw ApiError.notFound("Staff account not found");
  }
  if (existing.id === req.user!.id) {
    throw ApiError.badRequest("You cannot disable your own account");
  }

  const nextStatus = existing.status === "ACTIVE" ? "DISABLED" : "ACTIVE";
  const user = await userRepository.update(id, { status: nextStatus });

  await activityLogService.log({
    req,
    action: nextStatus === "DISABLED" ? "Disabled staff account" : "Reactivated staff account",
    module: "STAFF",
    description: user.email,
  });

  return authService.toPublicUser(user);
}

async function remove(id: string, req: Request) {
  const existing = await userRepository.findById(id);
  if (!existing) {
    throw ApiError.notFound("Staff account not found");
  }
  if (existing.id === req.user!.id) {
    throw ApiError.badRequest("You cannot delete your own account");
  }

  await userRepository.softDelete(id);
  await activityLogService.log({ req, action: "Deleted staff account", module: "STAFF", description: existing.email });
}

async function setPassword(id: string, newPassword: string, req: Request) {
  const existing = await userRepository.findById(id);
  if (!existing) {
    throw ApiError.notFound("Staff account not found");
  }

  const passwordHash = await hashPassword(newPassword);
  await userRepository.setPasswordByAdmin(id, passwordHash);

  await activityLogService.log({
    req,
    action: "Reset staff password",
    module: "STAFF",
    description: existing.email,
  });
}

async function updateAvatar(id: string, avatarUrl: string, req: Request) {
  const user = await userRepository.update(id, { avatarUrl });
  await activityLogService.log({ req, action: "Updated profile photo", module: "STAFF", description: user.email });
  return authService.toPublicUser(user);
}

export const userService = { list, getById, create, update, toggleStatus, remove, setPassword, updateAvatar };
