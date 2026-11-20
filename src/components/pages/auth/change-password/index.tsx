
import { useMemo, useState, useEffect, type FormEvent, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  KeyRound,
  Info,
  Check,
  X,
} from "lucide-react";
import { useAuthStore } from "../../../store/auth-store";
import { authService } from "../../../api/auth/auth-service";

interface PasswordFieldProps {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  show: boolean;
  onChange: (value: string) => void;
  onToggle: () => void;
}

const PasswordField = ({
  id,
  label,
  placeholder,
  value,
  show,
  onChange,
  onToggle,
}: PasswordFieldProps) => {
  return (
    <div className="min-w-0 space-y-2">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700"
      >
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete="new-password"
          className="w-full min-w-0 rounded-lg border border-gray-300 bg-white py-3 pl-4 pr-12 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-100"
        />

        <button
          type="button"
          onClick={onToggle}
          aria-label={show ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-400 transition hover:text-gray-700"
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
};

interface RequirementProps {
  met: boolean;
  children: ReactNode;
}

const Requirement = ({ met, children }: RequirementProps) => (
  <div
    className={`flex items-center gap-2 text-xs ${
      met ? "text-green-600" : "text-gray-500"
    }`}
  >
    {met ? <Check size={14} /> : <X size={14} />}
    <span>{children}</span>
  </div>
);

const ChangePassword = () => {
  const navigate = useNavigate();
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [isSaving, setIsSaving] = useState(false);

  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Redirect nếu chưa đăng nhập
  useEffect(() => {
    if (!accessToken || !user) {
      navigate("/login", {
        replace: true,
        state: { from: { pathname: "/change-password" } },
      });
    }
  }, [accessToken, user, navigate]);

  // Validation khớp backend: 6-20 ký tự, chữ hoa, chữ thường, số, ký tự đặc biệt
  const requirements = useMemo(
    () => [
      {
        label: "Ít nhất 6 ký tự",
        met: newPassword.length >= 6,
      },
      {
        label: "Không quá 20 ký tự",
        met: newPassword.length > 0 && newPassword.length <= 20,
      },
      {
        label: "Có chữ cái viết hoa",
        met: /[A-Z]/.test(newPassword),
      },
      {
        label: "Có chữ cái viết thường",
        met: /[a-z]/.test(newPassword),
      },
      {
        label: "Có ít nhất một chữ số",
        met: /\d/.test(newPassword),
      },
      {
        label: "Có ký tự đặc biệt (@$!%*?&)",
        met: /[@$!%*?&]/.test(newPassword),
      },
    ],
    [newPassword]
  );

  const strength = requirements.filter((item) => item.met).length;

  const strengthLabel = [
    "Chưa có",
    "Rất yếu",
    "Yếu",
    "Trung bình",
    "Khá tốt",
    "Tốt",
    "Mạnh",
  ][strength];

  const passwordsMatch =
    confirmPassword.length > 0 && newPassword === confirmPassword;

  const isValid =
    currentPassword.length > 0 &&
    strength === requirements.length &&
    passwordsMatch &&
    currentPassword !== newPassword;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!currentPassword) {
      setStatusMessage({
        type: "error",
        text: "Vui lòng nhập mật khẩu hiện tại.",
      });
      return;
    }

    if (strength < requirements.length) {
      setStatusMessage({
        type: "error",
        text: "Mật khẩu mới chưa đáp ứng đủ các yêu cầu bảo mật.",
      });
      return;
    }

    if (currentPassword === newPassword) {
      setStatusMessage({
        type: "error",
        text: "Mật khẩu mới phải khác mật khẩu hiện tại.",
      });
      return;
    }

    if (!passwordsMatch) {
      setStatusMessage({
        type: "error",
        text: "Mật khẩu xác nhận không khớp.",
      });
      return;
    }

    setIsSaving(true);

    try {
      await authService.changePassword({
        currentPassword,
        newPassword,
      });

      setStatusMessage({
        type: "success",
        text: "Đổi mật khẩu thành công!",
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      const apiMessage = axios.isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : undefined;

      setStatusMessage({
        type: "error",
        text:
          apiMessage ||
          "Không thể đổi mật khẩu. Vui lòng kiểm tra lại mật khẩu hiện tại.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto w-full min-w-0 max-w-5xl space-y-5 sm:space-y-6">
      {/* Page heading */}
      <div className="min-w-0">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600">
            <LockKeyhole size={21} />
          </div>

          <div className="min-w-0">
            <h1 className="text-lg font-bold text-gray-800 sm:text-xl">
              Đổi mật khẩu
            </h1>
            <p className="mt-1 text-xs text-gray-500 sm:text-sm">
              Cập nhật mật khẩu để bảo vệ tài khoản của bạn.
            </p>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="grid w-full min-w-0 grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-6">
        {/* Password form */}
        <section className="min-w-0 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-gray-100 bg-gray-50/70 px-4 py-4 sm:px-6">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-700">
              <KeyRound size={18} />
            </div>

            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-gray-800 sm:text-base">
                Thông tin mật khẩu
              </h2>
              <p className="mt-0.5 text-xs text-gray-500">
                Nhập thông tin để thay đổi mật khẩu.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 p-4 sm:p-6">
            {/* Current password */}
            <PasswordField
              id="currentPassword"
              label="Mật khẩu hiện tại"
              placeholder="Nhập mật khẩu hiện tại"
              value={currentPassword}
              show={showCurrent}
              onChange={setCurrentPassword}
              onToggle={() => setShowCurrent(!showCurrent)}
            />

            <div className="border-t border-gray-100" />

            {/* New password */}
            <PasswordField
              id="newPassword"
              label="Mật khẩu mới"
              placeholder="Nhập mật khẩu mới"
              value={newPassword}
              show={showNew}
              onChange={setNewPassword}
              onToggle={() => setShowNew(!showNew)}
            />

            {/* Password strength */}
            {newPassword.length > 0 && (
              <div className="space-y-3 rounded-lg bg-gray-50 p-3 sm:p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-medium text-gray-600">
                    Độ mạnh mật khẩu
                  </span>

                  <span
                    className={`text-xs font-semibold ${
                      strength >= 4 ? "text-green-600" : "text-orange-500"
                    }`}
                  >
                    {strengthLabel}
                  </span>
                </div>

                <div className="flex gap-1.5">
                  {requirements.map((item, index) => (
                    <div
                      key={index}
                      className={`h-1.5 flex-1 rounded-full ${
                        item.met ? "bg-green-500" : "bg-gray-200"
                      }`}
                    />
                  ))}
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {requirements.map((item) => (
                    <Requirement key={item.label} met={item.met}>
                      {item.label}
                    </Requirement>
                  ))}
                </div>
              </div>
            )}

            {/* Confirm password */}
            <PasswordField
              id="confirmPassword"
              label="Xác nhận mật khẩu mới"
              placeholder="Nhập lại mật khẩu mới"
              value={confirmPassword}
              show={showConfirm}
              onChange={setConfirmPassword}
              onToggle={() => setShowConfirm(!showConfirm)}
            />

            {confirmPassword.length > 0 && (
              <div
                className={`flex items-center gap-2 text-xs ${
                  passwordsMatch ? "text-green-600" : "text-red-500"
                }`}
              >
                {passwordsMatch ? (
                  <CheckCircle2 size={15} />
                ) : (
                  <AlertCircle size={15} />
                )}

                {passwordsMatch
                  ? "Mật khẩu xác nhận trùng khớp."
                  : "Mật khẩu xác nhận không khớp."}
              </div>
            )}

            {/* Status message */}
            {statusMessage && (
              <div
                role="alert"
                className={`flex items-start gap-2 rounded-lg border p-3 text-sm ${
                  statusMessage.type === "success"
                    ? "border-green-200 bg-green-50 text-green-700"
                    : "border-red-200 bg-red-50 text-red-700"
                }`}
              >
                {statusMessage.type === "success" ? (
                  <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                ) : (
                  <AlertCircle size={18} className="mt-0.5 shrink-0" />
                )}

                <span className="min-w-0 break-words">
                  {statusMessage.text}
                </span>
              </div>
            )}

            {/* Submit */}
            <div className="border-t border-gray-100 pt-5">
              <button
                type="submit"
                disabled={isSaving || !isValid}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                {isSaving ? (
                  <>
                    <Loader2 size={17} className="animate-spin" />
                    Đang cập nhật...
                  </>
                ) : (
                  <>
                    <ShieldCheck size={17} />
                    Đổi mật khẩu
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        {/* Security tips */}
        <aside className="min-w-0 space-y-4">
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex items-center gap-2">
              <ShieldCheck size={19} className="shrink-0 text-green-600" />
              <h3 className="text-sm font-semibold text-gray-800">
                Mẹo bảo mật
              </h3>
            </div>

            <div className="mt-4 space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-50 text-green-600">
                  <LockKeyhole size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-700">
                    Sử dụng mật khẩu mạnh
                  </p>
                  <p className="mt-1 text-xs leading-5 text-gray-500">
                    Kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-50 text-green-600">
                  <KeyRound size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-700">
                    Không sử dụng lại mật khẩu
                  </p>
                  <p className="mt-1 text-xs leading-5 text-gray-500">
                    Hạn chế sử dụng cùng một mật khẩu trên nhiều nền tảng.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-50 text-green-600">
                  <ShieldCheck size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-700">
                    Thay đổi định kỳ
                  </p>
                  <p className="mt-1 text-xs leading-5 text-gray-500">
                    Cập nhật mật khẩu khi nghi ngờ tài khoản bị truy cập trái phép.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
            <Info size={18} className="mt-0.5 shrink-0 text-blue-600" />
            <p className="text-xs leading-5 text-blue-700">
              Không chia sẻ mật khẩu hoặc mã xác thực của bạn với bất kỳ ai.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ChangePassword;
