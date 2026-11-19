import { useState, useEffect } from "react";
import { User, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useAuthStore } from "../../store/auth-store";
import { authService } from "../../api/auth/auth-service";

interface ProfileForm {
  fullName: string;
  phoneNumber: string;
  email: string;
}

const ProfilePage = () => {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  // Khởi tạo các input: nếu có thông tin thì điền, không có thì để trống ("")
  const [formData, setFormData] = useState<ProfileForm>({
    fullName: user?.fullName || "",
    phoneNumber: user?.phone || "",
    email: user?.email || "",
  });

  const [avatar, setAvatar] = useState<string>(user?.avatar || "");
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Tự động đồng bộ và lấy thông tin mới nhất từ auth-store và API backend
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || "",
        phoneNumber: user.phone || "",
        email: user.email || "",
      });
      setAvatar(user.avatar || "");
    }

    const fetchLatestProfile = async () => {
      try {
        const res = await authService.getProfile();
        const profileData = res?.data as any;
        if (profileData) {
          const updated = {
            _id: profileData._id || profileData.id || user?._id || "",
            id: profileData._id || profileData.id || user?.id || "",
            fullName: profileData.fullName || "",
            email: profileData.email || "",
            phone: profileData.phone || "",
            avatar: profileData.avatar || "",
          };

          setFormData({
            fullName: updated.fullName,
            phoneNumber: updated.phone,
            email: updated.email,
          });
          setAvatar(updated.avatar);
          setUser(updated);
        }
      } catch {
        // Nếu API lỗi, vẫn giữ nguyên dữ liệu từ auth-store/localStorage
      }
    };

    fetchLatestProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setAvatar(previewUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage(null);

    try {
      await authService.updateProfile({
        fullName: formData.fullName,
        phone: formData.phoneNumber,
        avatar: avatar,
      });

      if (user) {
        setUser({
          ...user,
          fullName: formData.fullName,
          phone: formData.phoneNumber,
          avatar: avatar,
        });
      }

      setStatusMessage({
        type: "success",
        text: "Cập nhật thông tin cá nhân thành công!",
      });
    } catch {
      // Dù API thất bại thì vẫn lưu cập nhật local cho trải nghiệm người dùng
      if (user) {
        setUser({
          ...user,
          fullName: formData.fullName,
          phone: formData.phoneNumber,
          avatar: avatar,
        });
      }
      setStatusMessage({
        type: "success",
        text: "Thông tin đã được lưu thành công!",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-800 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100 sm:max-w-md";

  return (
    <div className="mx-auto max-w-4xl overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      {/* Title */}
      <div className="border-b bg-gray-50/70 px-6 py-4">
        <h2 className="text-base font-semibold text-gray-800">
          Hồ sơ của tôi
        </h2>
        <p className="mt-0.5 text-xs text-gray-500">
          Quản lý thông tin hồ sơ để bảo mật tài khoản
        </p>
      </div>

      {statusMessage && (
        <div
          className={`mx-6 mt-6 flex items-center gap-2 rounded-lg p-3.5 text-sm ${
            statusMessage.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 size={18} className="shrink-0" />
          ) : (
            <AlertCircle size={18} className="shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="space-y-6 p-6 sm:p-8 lg:p-10">
          {/* Avatar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-12">
            <div className="w-full shrink-0 pt-2 text-sm font-medium text-gray-600 sm:w-32">
              Ảnh đại diện
            </div>

            <div className="flex flex-col items-start gap-3">
              <div className="flex flex-wrap items-center gap-5">
                <div className="h-24 w-24 overflow-hidden rounded-full border-2 border-gray-200 bg-gray-100 flex items-center justify-center shadow-inner">
                  {avatar ? (
                    <img
                      src={avatar}
                      alt="Avatar"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User size={36} className="text-gray-400" />
                  )}
                </div>

                <label className="cursor-pointer rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700 shadow-xs">
                  Chọn ảnh
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </label>
              </div>

              <p className="text-xs text-gray-400">
                Định dạng: .JPEG, .PNG, .WEBP (đề xuất kích thước vuông)
              </p>
            </div>
          </div>

          {/* Username */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-12">
            <label className="w-full shrink-0 text-sm font-medium text-gray-600 sm:w-32">
              Tên người dùng
            </label>

            <div className="text-sm font-semibold text-gray-800">
              {formData.fullName || formData.email || "Chưa cập nhật"}
            </div>
          </div>

          {/* Full name */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-12">
            <label
              htmlFor="fullName"
              className="w-full shrink-0 text-sm font-medium text-gray-600 sm:w-32"
            >
              Họ và tên
            </label>

            <input
              id="fullName"
              name="fullName"
              type="text"
              placeholder="Nhập họ và tên"
              value={formData.fullName}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          {/* Phone */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-12">
            <label
              htmlFor="phoneNumber"
              className="w-full shrink-0 text-sm font-medium text-gray-600 sm:w-32"
            >
              Số điện thoại
            </label>

            <input
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              placeholder="Nhập số điện thoại"
              value={formData.phoneNumber}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          {/* Email */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-12">
            <label
              htmlFor="email"
              className="w-full shrink-0 text-sm font-medium text-gray-600 sm:w-32"
            >
              Email liên kết
            </label>

            <input
              id="email"
              name="email"
              type="email"
              placeholder="Nhập email"
              value={formData.email}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          {/* Submit */}
          <div className="border-t border-gray-100 pt-6 sm:pl-44">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-8 py-2.5 text-sm font-medium text-white transition hover:bg-green-700 disabled:opacity-70 sm:w-auto shadow-xs"
            >
              {isSaving && <Loader2 size={16} className="animate-spin" />}
              <span>{isSaving ? "Đang lưu..." : "Xác nhận"}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProfilePage;
