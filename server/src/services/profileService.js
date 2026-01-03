import prisma from "../config/prisma.js";
import bcrypt from "bcrypt";

export const profileService = {
  //Get Profile by UserId
  async getProfileByUserId(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        _count: {
          select: {
            loans: true,
            reservations: true,
            fines: { where: { status: { not: "paid" } } },
          },
        },
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      profile: user.profile,
      stats: {
        activeLoans: user._count.loans,
        activeReservations: user._count.reservations,
        unpaidFines: user._count.fines,
      },
    };
  },

  //UpdateProfile
  async updateProfile(userId, data) {
    const { fullName, phone, address, avatarUrl } = data;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const updatedProfile = await prisma.profile.update({
      where: { userId },
      data: {
        fullName: fullName || user.profile.fullName,
        phone: phone !== undefined ? phone : user.profile.phone,
        address: address !== undefined ? address : user.profile.address,
        avatarUrl: avatarUrl !== undefined ? avatarUrl : user.profile.avatarUrl,
      },
    });

    return updatedProfile;
  },

  //UploadAvatar
  async uploadAvatar(userId, pictureUrl) {
    const updatedProfile = await prisma.profile.update({
      where: { userId },
      data: { pictureUrl },
    });
    return updatedProfile;
  },

  //ChangePassword
  async changePassword(userId, oldPassword, newPassword) {
    const bcrypt = await import("bcrypt");

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    //Verify old password
    const isPasswordValid = await bcrypt.compare(
      oldPassword,
      user.passwordHash
    );

    if (!isPasswordValid) {
      throw new Error("Old password is incorrect");
    }

    const newHashedPassword = await bcrypt.hash(newPassword, 10);

    //update new password
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newHashedPassword },
    });

    return { message: "Password changed successfully" };
  },
};
