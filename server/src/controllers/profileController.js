import { profileService } from "../services/profileService.js";

export const profileController = {
  //GET /api/profile
  async getProfile(req, res, next) {
    try {
      const userId = req.user.userId;

      const profile = await profileService.getProfileByUserId(userId);

      res.json({
        success: true,
        message: "Profile retrieved successfully",
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  },

  //PUT /api/profile
  async updateProfile(req, res, next) {
    try {
      const userId = req.user.userId;
      const { fullName, phone, address} = req.body;

      const updatedProfile = await profileService.updateProfile(userId, {
        fullName,
        phone,
        address,
      });

      res.json({
        success: true,
        message: "Profile updated successfully",
        data: updatedProfile,
      });
    } catch (error) {
      next(error);
    }
  },

  //PUT /api/profile/avatar
  async updateAvatar(req, res, next) {
    try {
      const userId = req.user.userId;
      const { avatarUrl } = req.body;

      if (!avatarUrl) {
        return res.status(400).json({
          success: false,
          message: "Avatar URL is required",
        });
      }

      const profile = await profileService.updateProfile(userId, {
        avatarUrl,
      });

      res.json({
        success: true,
        message: "Avatar updated successfully",
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  },

  //POST /api/profile/change-password
  async changePassword(req, res, next) {
    try {
      const userId = req.user.userId;
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: "Current password and new password are required",
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: "New password must be at least 6 characters long",
        });
      }

      if (currentPassword === newPassword) {
        return res.status(400).json({
          success: false,
          message: "New password must be different from current password",
        });
      }

      const result = await profileService.changePassword(
        userId,
        currentPassword,
        newPassword
      );

      res.json({
        success: true,
        message: "Password changed successfully",
        data: result,
      });
    } catch (error) {
      if (error.message === "Current password is incorrect") {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  },
};
