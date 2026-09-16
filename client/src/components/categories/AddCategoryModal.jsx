import { useState } from "react";
import { X } from "lucide-react";
import { createCategory } from "../../api/categoryApi";

const AddCategoryModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    type: "EXPENSE",
    icon: "🍽️",
    color: "#8b5cf6",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const icons = [
    "🍽️",
    "🚗",
    "🛍️",
    "🏠",
    "❤️",
    "🎓",
    "🎮",
    "💼",
    "💰",
    "📱",
    "✈️",
    "🏋️",
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError("Category name is required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await createCategory({
        name: formData.name.trim(),
        type: formData.type,
        icon: formData.icon,
        color: formData.color,
      });

      console.log("Create category response:", response);

      // Backend returns category inside response.data
      onSuccess(response.data);

      onClose();
    } catch (error) {
      console.error("Create category error:", error);

      setError(error.response?.data?.message || "Failed to create category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Add Category</h2>

            <p className="mt-1 text-sm text-gray-500">
              Create a new expense or income category
            </p>
          </div>

          <button
            onClick={onClose}
            disabled={loading}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          {/* Error */}
          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Category Name
            </label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Food"
              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
            />
          </div>

          {/* Type */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Type
            </label>

            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
            >
              <option value="EXPENSE">Expense</option>

              <option value="INCOME">Income</option>
            </select>
          </div>

          {/* Icon */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Icon
            </label>

            <div className="grid grid-cols-6 gap-2">
              {icons.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      icon,
                    })
                  }
                  className={`flex h-11 items-center justify-center rounded-lg border text-xl transition ${
                    formData.icon === icon
                      ? "border-violet-500 bg-violet-50"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Color
            </label>

            <div className="flex items-center gap-3">
              <input
                type="color"
                name="color"
                value={formData.color}
                onChange={handleChange}
                className="h-10 w-14 cursor-pointer rounded-lg border border-gray-200"
              />

              <span className="text-sm text-gray-500">{formData.color}</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white hover:from-violet-700 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating..." : "Create Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCategoryModal;
