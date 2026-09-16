import { useEffect, useState } from "react";
import {
  Plus,
  Tags,
  Pencil,
  Trash2,
  MoreVertical,
  Loader2,
} from "lucide-react";

import PageLayout from "../components/layout/PageLayout";

import AddCategoryModal from "../components/categories/AddCategoryModal";
import EditCategoryModal from "../components/categories/EditCategoryModal";
import DeleteCategoryModal from "../components/categories/DeleteCategoryModal";

import { getCategories } from "../api/categoryApi";

const Categories = () => {
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Add
  const [showAddModal, setShowAddModal] = useState(false);

  // Edit
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Delete
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  // Menu
  const [openMenu, setOpenMenu] = useState(null);

  // --------------------------------
  // Fetch Categories
  // --------------------------------

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getCategories();

        console.log("Categories API:", response);

        setCategories(response.categories || response.data || []);
      } catch (error) {
        console.error("Get categories error:", error);

        setError(error.response?.data?.message || "Failed to load categories");
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  // --------------------------------
  // Add Category
  // --------------------------------

  const handleCategoryAdded = (newCategory) => {
    setCategories((prevCategories) => [newCategory, ...prevCategories]);
  };

  // --------------------------------
  // Edit Category
  // --------------------------------

  const handleEdit = (category) => {
    setSelectedCategory(category);
    setShowEditModal(true);
    setOpenMenu(null);
  };

  const handleCategoryUpdated = (updatedCategory) => {
    setCategories((prevCategories) =>
      prevCategories.map((category) =>
        category._id === updatedCategory._id ? updatedCategory : category,
      ),
    );

    setSelectedCategory(null);
  };

  // --------------------------------
  // Delete Category
  // --------------------------------

  const handleDelete = (category) => {
    setCategoryToDelete(category);
    setShowDeleteModal(true);
    setOpenMenu(null);
  };

  const handleCategoryDeleted = (categoryId) => {
    setCategories((prevCategories) =>
      prevCategories.filter((category) => category._id !== categoryId),
    );

    setCategoryToDelete(null);
  };

  // --------------------------------
  // Loading
  // --------------------------------

  if (loading) {
    return (
      <PageLayout
        title="Categories"
        subtitle="Manage your income and expense categories"
      >
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="flex items-center gap-3 text-gray-500">
            <Loader2 size={22} className="animate-spin" />

            <p>Loading categories...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  // --------------------------------
  // Error
  // --------------------------------

  if (error) {
    return (
      <PageLayout
        title="Categories"
        subtitle="Manage your income and expense categories"
      >
        <div className="rounded-xl border border-red-100 bg-red-50 p-5 text-center">
          <p className="font-medium text-red-600">{error}</p>

          <button
            onClick={() => window.location.reload()}
            className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Categories"
      subtitle="Manage your income and expense categories"
    >
      <div className="space-y-6">
        {/* ================================= */}
        {/* Header */}
        {/* ================================= */}

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Your Categories
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Organize your transactions by category
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:from-violet-700 hover:to-purple-700"
          >
            <Plus size={18} />
            Add Category
          </button>
        </div>

        {/* ================================= */}
        {/* Summary Cards */}
        {/* ================================= */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Total */}
          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <Tags size={21} />
              </div>

              <div>
                <p className="text-sm text-gray-500">Total Categories</p>

                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {categories.length}
                </p>
              </div>
            </div>
          </div>

          {/* Expense */}
          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <Tags size={21} />
              </div>

              <div>
                <p className="text-sm text-gray-500">Expense Categories</p>

                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {
                    categories.filter((category) => category.type === "EXPENSE")
                      .length
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Income */}
          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-600">
                <Tags size={21} />
              </div>

              <div>
                <p className="text-sm text-gray-500">Income Categories</p>

                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {
                    categories.filter((category) => category.type === "INCOME")
                      .length
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ================================= */}
        {/* Empty State */}
        {/* ================================= */}

        {categories.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
              <Tags size={28} />
            </div>

            <h3 className="mt-5 text-lg font-semibold text-gray-900">
              No categories found
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
              Create your first category to organize your expenses and income.
            </p>

            <button
              onClick={() => setShowAddModal(true)}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"
            >
              <Plus size={18} />
              Add Category
            </button>
          </div>
        ) : (
          /* ================================= */
          /* Category Grid */
          /* ================================= */

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {categories.map((category) => (
              <div
                key={category._id}
                className="group relative rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                {/* Top */}
                <div className="flex items-start justify-between">
                  {/* Icon */}
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl"
                    style={{
                      backgroundColor: `${category.color || "#8b5cf6"}15`,
                    }}
                  >
                    {category.icon || "🏷️"}
                  </div>

                  {/* Menu */}
                  <div className="relative">
                    <button
                      onClick={() =>
                        setOpenMenu(
                          openMenu === category._id ? null : category._id,
                        )
                      }
                      className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                    >
                      <MoreVertical size={19} />
                    </button>

                    {openMenu === category._id && (
                      <div className="absolute right-0 top-10 z-20 w-36 overflow-hidden rounded-lg border border-gray-100 bg-white py-1 shadow-lg">
                        {/* Edit */}
                        <button
                          onClick={() => handleEdit(category)}
                          className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <Pencil size={15} />
                          Edit
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(category)}
                          className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={15} />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Category Info */}
                <div className="mt-4">
                  <h3 className="truncate text-base font-semibold text-gray-900">
                    {category.name}
                  </h3>

                  <div className="mt-2">
                    {category.type === "EXPENSE" ? (
                      <span className="inline-flex rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600">
                        Expense
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-600">
                        Income
                      </span>
                    )}
                  </div>
                </div>

                {/* Default */}
                {category.isDefault && (
                  <div className="mt-4 border-t border-gray-100 pt-3">
                    <span className="text-xs font-medium text-gray-400">
                      Default category
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ================================= */}
      {/* Add Modal */}
      {/* ================================= */}

      {showAddModal && (
        <AddCategoryModal
          onClose={() => setShowAddModal(false)}
          onSuccess={handleCategoryAdded}
        />
      )}

      {/* ================================= */}
      {/* Edit Modal */}
      {/* ================================= */}

      {showEditModal && selectedCategory && (
        <EditCategoryModal
          category={selectedCategory}
          onClose={() => {
            setShowEditModal(false);
            setSelectedCategory(null);
          }}
          onSuccess={handleCategoryUpdated}
        />
      )}

      {/* ================================= */}
      {/* Delete Modal */}
      {/* ================================= */}

      {showDeleteModal && categoryToDelete && (
        <DeleteCategoryModal
          category={categoryToDelete}
          onClose={() => {
            setShowDeleteModal(false);
            setCategoryToDelete(null);
          }}
          onSuccess={handleCategoryDeleted}
        />
      )}
    </PageLayout>
  );
};

export default Categories;
