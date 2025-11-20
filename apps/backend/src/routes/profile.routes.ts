import { Hono } from "hono";
import { profileController } from "@/controllers/profile.controller";
import { authMiddleware } from "@/middleware/auth.middleware";

const profile = new Hono();

// All routes require authentication
profile.use("/*", authMiddleware);

// Get current user profile
profile.get("/", (c) => profileController.getProfile(c));

// Update profile (name, email)
profile.patch("/", (c) => profileController.updateProfile(c));

// Change password
profile.post("/change-password", (c) => profileController.changePassword(c));

// Delete account
profile.delete("/", (c) => profileController.deleteAccount(c));

export default profile;
