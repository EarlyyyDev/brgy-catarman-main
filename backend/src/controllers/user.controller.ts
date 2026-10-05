import { Request, Response } from "express";
import { userService } from "../services/user.service";
import { sendSuccess } from "../utils/apiResponse.util";
import { asyncHandler } from "../utils/asyncHandler.util";
import { publicUrlFor } from "../config/multer";

export const listUsers = asyncHandler(async (req: Request, res: Response) => {
  const { role, status, search } = req.query as {
    role?: "STAFF" | "ADMINISTRATOR";
    status?: "ACTIVE" | "DISABLED";
    search?: string;
  };
  const result = await userService.list(req, { role, status, search });
  sendSuccess(res, result);
});

export const getUser = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  const user = await userService.getById(req.params.id);
  sendSuccess(res, user);
});

export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, role, position, contactNumber } = req.body as {
    name: string;
    email: string;
    role: "STAFF" | "ADMINISTRATOR";
    position: string;
    contactNumber?: string;
  };
  const result = await userService.create({ name, email, role, position, contactNumber, req });
  sendSuccess(res, result, 201);
});

export const updateUser = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  const user = await userService.update(req.params.id, req.body, req);
  sendSuccess(res, user);
});

export const toggleUserStatus = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  const user = await userService.toggleStatus(req.params.id, req);
  sendSuccess(res, user);
});

export const deleteUser = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  await userService.remove(req.params.id, req);
  sendSuccess(res, { deleted: true });
});

export const setUserPassword = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  const { newPassword } = req.body as { newPassword: string };
  await userService.setPassword(req.params.id, newPassword, req);
  sendSuccess(res, { message: "Password reset successfully." });
});

export const updateUserAvatar = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  if (!req.file) {
    sendSuccess(res, { message: "No file uploaded" }, 400);
    return;
  }
  const url = publicUrlFor("staff", req.file.filename);
  const user = await userService.updateAvatar(req.params.id, url, req);
  sendSuccess(res, user);
});
