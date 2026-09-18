import { useEffect, useState } from "react";
import {
  User,
  Mail,
  IndianRupee,
  Camera,
  LockKeyhole,
  Save,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import PageLayout from "../components/layout/PageLayout";
import { useAuth } from "../context/useAuth";
import { updateProfile } from "../api/authApi";

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    currency: "INR",
  });

  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const [saving, setSaving] = useState(false);

  // Custom message
  const [message, setMessage] = useState({
    type: "",
    text: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        currency: user.currency || "INR",
      });

      setPreviewImage(user.profileImage || null);
    }
  }, [user]);

  const showMessage = (type, text) => {
    setMessage({
      type,
      text,
    });

    // Automatically hide after 4 seconds
    setTimeout(() => {
      setMessage({
        type: "",
        text: "",
      });
    }, 4000);
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

    // Remove error when user starts typing
    if (message.type === "error") {
      setMessage({
        type: "",
        text: "",
      });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    // Validate image type
    if (!file.type.startsWith("image/")) {
      showMessage("error", "Please select a valid image file.");
      return;
    }

    // Validate image size
    if (file.size > 2 * 1024 * 1024) {
      showMessage("error", "Profile image must be smaller than 2MB.");
      return;
    }

    setProfileImage(file);
    setPreviewImage(URL.createObjectURL(file));

    showMessage(
      "success",
      "Profile photo selected. Click Save Changes to update it.",
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage({
      type: "",
      text: "",
    });

    if (!formData.name.trim()) {
      showMessage("error", "Please enter your name.");
      return;
    }

    if (formData.name.trim().length < 2) {
      showMessage("error", "Name must contain at least 2 characters.");
      return;
    }

    setSaving(true);

    try {
      const response = await updateProfile({
        name: formData.name.trim(),
        currency: formData.currency,
      });

      console.log("Profile updated:", response);

      // Show success message
      setMessage({
        type: "success",
        text: response?.message || "Profile updated successfully.",
      });

      // Refresh the complete page after saving
      setTimeout(() => {
        window.location.reload();
      }, 800);
    } catch (error) {
      console.error("Profile update error:", error);

      const errorMessage =
        error?.response?.data?.message ||
        "Unable to update your profile. Please try again.";

      setMessage({
        type: "error",
        text: errorMessage,
      });
    } finally {
      setSaving(false);
    }
  };

  const initial = formData.name?.charAt(0)?.toUpperCase() || "U";

  return (
    <PageLayout
      title="Profile"
      subtitle="Manage your personal information and preferences"
    >
      <div className="mx-auto w-full max-w-4xl space-y-4 sm:space-y-5 lg:space-y-6">
        {/* Back */}
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-gray-900"
        >
          <ArrowLeft size={17} />
          Back
        </button>

        {/* Custom Message */}
        {message.text && (
          <div
            className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${
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

            <p className="font-medium">{message.text}</p>
          </div>
        )}

        {/* Profile Card */}
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          {/* Top section */}
          <div className="border-b border-gray-100 bg-gradient-to-r from-violet-50 to-purple-50 px-4 py-5 sm:px-6 sm:py-6">
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              {/* Avatar */}
              <div className="relative">
                <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-orange-200 text-3xl font-bold text-gray-800 shadow-sm sm:h-28 sm:w-28">
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    initial
                  )}
                </div>

                {/* Camera */}
                <label
                  htmlFor="profileImage"
                  className="absolute bottom-0 right-0 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-violet-600 text-white shadow-md transition hover:bg-violet-700"
                  title="Change profile photo"
                >
                  <Camera size={16} />

                  <input
                    id="profileImage"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="text-center sm:text-left">
                <h2 className="text-lg font-bold text-gray-900 sm:text-xl">
                  {user?.name || "Your Name"}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {formData.email || "Your email"}
                </p>

                <p className="mt-2 text-xs text-gray-400">
                  Click the camera icon to change your photo
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="space-y-5 p-4 sm:p-6">
              {/* Name */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Full Name
                </label>

                <div className="relative">
                  <User
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    className="h-11 w-full rounded-lg border border-gray-200 bg-white pl-10 pr-3 text-sm text-gray-900 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Email Address
                </label>

                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="h-11 w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-50 pl-10 pr-3 text-sm text-gray-500 outline-none"
                  />
                </div>

                <p className="mt-1.5 text-xs text-gray-400">
                  Email address cannot be changed here.
                </p>
              </div>

              {/* Currency */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Currency
                </label>

                <div className="relative">
                  <IndianRupee
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleChange}
                    className="h-11 w-full appearance-none rounded-lg border border-gray-200 bg-white pl-10 pr-3 text-sm text-gray-900 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                  >
                    <option value="INR">INR - Indian Rupee</option>

                    <option value="USD">USD - US Dollar</option>

                    <option value="EUR">EUR - Euro</option>

                    <option value="GBP">GBP - British Pound</option>

                    <option value="AED">AED - UAE Dirham</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 border-t border-gray-100 bg-gray-50 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              {/* Change Password */}
              <button
                type="button"
                onClick={() => navigate("/change-password")}
                className="flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-violet-600 transition hover:bg-violet-50 sm:justify-start"
              >
                <LockKeyhole size={17} />
                Change Password
              </button>

              {/* Save */}
              <button
                type="submit"
                disabled={saving}
                className="flex h-11 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:from-violet-700 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <Loader2 size={17} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={17} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Security Card */}
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
              <LockKeyhole size={19} />
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-900 sm:text-base">
                Account Security
              </h3>

              <p className="text-xs text-gray-500 sm:text-sm">
                Keep your account secure by updating your password.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate("/change-password")}
            className="mt-4 flex w-full items-center justify-center rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 sm:w-auto"
          >
            Change Password
          </button>
        </div>
      </div>
    </PageLayout>
  );
};

export default Profile;
