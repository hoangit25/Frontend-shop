import request from "../../utils/request";
import type { BackendResponse } from "../../types/cart.type";
import type { AuthUser } from "../../store/auth-store";

export interface UpdateProfilePayload {
  fullName?: string;
  phone?: string;
  avatar?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export const authService = {
  // Lấy thông tin cá nhân của người dùng hiện tại
  getProfile: async () => {
    try {
      return await request.get<BackendResponse<AuthUser>>("/auth/profile");
    } catch {
      return await request.get<BackendResponse<AuthUser>>("/users/me");
    }
  },

  // Cập nhật thông tin cá nhân
  updateProfile: async (payload: UpdateProfilePayload) => {
    try {
      return await request.put<BackendResponse<AuthUser>, UpdateProfilePayload>(
        "/auth/profile",
        payload
      );
    } catch {
      return await request.put<BackendResponse<AuthUser>, UpdateProfilePayload>(
        "/users/profile",
        payload
      );
    }
  },

  // Đổi mật khẩu (đã đăng nhập)
  changePassword: async (payload: ChangePasswordPayload) => {
    return await request.put<BackendResponse<{ message: string }>, ChangePasswordPayload>(
      "/auth/change-password",
      payload
    );
  },

  // Đăng xuất
  logout: () => {
    return request.post<BackendResponse<null>>("/auth/logout");
  },
};
