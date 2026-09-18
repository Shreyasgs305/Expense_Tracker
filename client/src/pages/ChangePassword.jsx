import { useState } from "react";
import {
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowLeft,
  Loader2,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import PageLayout from "../components/layout/PageLayout";
import { changePassword } from "../api/authApi";

// Password Input Component
const PasswordInput = ({
  label,
  name,
  value,
  showPassword,
  setShowPassword,
  placeholder,
  onChange,
}) => {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-gray-700">
        {label}
      </label>

      <div className="relative">
        <LockKeyhole
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />

        <input
          type={showPassword ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete="off"
          className="h-11 w-full rounded-lg border border-gray-200 bg-white pl-10 pr-11 text-sm text-gray-900 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
        />

        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-700"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
};

const ChangePassword = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [saving, setSaving] = useState(false);

  // Custom message
  const [message, setMessage] = useState({
    type: "",
    text: "",
  });

  const showMessage = (type, text) => {
    setMessage({
      type,
      text,
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear previous error while typing
    if (message.text) {
      setMessage({
        type: "",
        text: "",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous message
    setMessage({
      type: "",
      text: "",
    });

    const { currentPassword, newPassword, confirmPassword } = formData;

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      showMessage("error", "Please fill in all password fields.");
      return;
    }

    if (newPassword.length < 6) {
      showMessage("error", "New password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      showMessage("error", "New password and confirm password do not match.");
      return;
    }

    if (currentPassword === newPassword) {
      showMessage(
        "error",
        "New password must be different from your current password.",
      );
      return;
    }

    setSaving(true);

    try {
      const response = await changePassword({
        currentPassword,
        newPassword,
      });

      // Success message
      showMessage(
        "success",
        response?.message || "Password changed successfully.",
      );

      // Clear fields
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      // Go back after short delay
      setTimeout(() => {
        navigate("/profile");
      }, 1200);
    } catch (error) {
      console.error("Change password error:", error);

      const errorMessage =
        error?.response?.data?.message ||
        "Unable to change password. Please try again.";

      showMessage("error", errorMessage);
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageLayout title="Change Password" subtitle="Update your account password">
      <div className="mx-auto w-full max-w-2xl">
        {/* Back */}
        <button
          type="button"
          onClick={() => navigate("/profile")}
          className="mb-4 flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-gray-900"
        >
          <ArrowLeft size={17} />
          Back to Profile
        </button>

        {/* Custom Message */}
        {message.text && (
          <div
            className={`mb-4 flex items-start gap-3 rounded-xl border px-4 py-3 ${
              message.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle2 size={19} className="mt-0.5 shrink-0" />
            ) : (
              <AlertCircle size={19} className="mt-0.5 shrink-0" />
            )}

            <div>
              <p className="text-sm font-semibold">
                {message.type === "success" ? "Success" : "Error"}
              </p>

              <p className="mt-0.5 text-xs sm:text-sm">{message.text}</p>
            </div>
          </div>
        )}

        {/* Card */}
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          {/* Header */}
          <div className="border-b border-gray-100 bg-gradient-to-r from-violet-50 to-purple-50 px-4 py-5 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white shadow-sm">
                <ShieldCheck size={21} />
              </div>

              <div>
                <h2 className="text-base font-bold text-gray-900 sm:text-lg">
                  Change Password
                </h2>

                <p className="text-xs text-gray-500 sm:text-sm">
                  Keep your account secure with a strong password.
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="space-y-5 p-4 sm:p-6">
              <PasswordInput
                label="Current Password"
                name="currentPassword"
                value={formData.currentPassword}
                showPassword={showCurrent}
                setShowPassword={setShowCurrent}
                placeholder="Enter current password"
                onChange={handleChange}
              />

              <PasswordInput
                label="New Password"
                name="newPassword"
                value={formData.newPassword}
                showPassword={showNew}
                setShowPassword={setShowNew}
                placeholder="Enter new password"
                onChange={handleChange}
              />

              <PasswordInput
                label="Confirm New Password"
                name="confirmPassword"
                value={formData.confirmPassword}
                showPassword={showConfirm}
                setShowPassword={setShowConfirm}
                placeholder="Confirm new password"
                onChange={handleChange}
              />

              {/* Password requirements */}
              <div className="rounded-lg bg-gray-50 p-3.5">
                <p className="mb-2 text-xs font-semibold text-gray-700">
                  Password requirements
                </p>

                <ul className="space-y-1 text-xs text-gray-500">
                  <li>• At least 6 characters</li>
                  <li>• Use a password you don't use elsewhere</li>
                  <li>• New password must differ from current password</li>
                </ul>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col-reverse gap-3 border-t border-gray-100 bg-gray-50 p-4 sm:flex-row sm:justify-end sm:px-6">
              <button
                type="button"
                onClick={() => navigate("/profile")}
                disabled={saving}
                className="h-11 rounded-lg border border-gray-200 bg-white px-5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="flex h-11 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:from-violet-700 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <Loader2 size={17} className="animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <LockKeyhole size={17} />
                    Update Password
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </PageLayout>
  );
};

export default ChangePassword;
