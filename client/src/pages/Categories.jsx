import { useEffect, useMemo, useState } from "react";

import {
  Plus,
  Tags,
  Pencil,
  Trash2,
  MoreVertical,
  Loader2,
  ArrowDownLeft,
  ArrowUpRight,
} from "lucide-react";

import PageLayout from "../components/layout/PageLayout";

import AddCategoryModal from "../components/categories/AddCategoryModal";
import EditCategoryModal from "../components/categories/EditCategoryModal";
import DeleteCategoryModal from "../components/categories/DeleteCategoryModal";

import { getCategories } from "../api/categoryApi";

const Categories = () => {
  // ======================================================
  // STATE
  // ======================================================

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

  // ======================================================
  // LOAD CATEGORIES
  // ======================================================

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getCategories();

      console.log("Categories API:", response);

      const categoryData =
        response?.categories ||
        response?.data?.categories ||
        response?.data ||
        [];

      setCategories(Array.isArray(categoryData) ? categoryData : []);
    } catch (error) {
      console.error("Get categories error:", error);

      setError(error.response?.data?.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // ======================================================
  // COUNTS
  // ======================================================

  const expenseCategories = useMemo(() => {
    return categories.filter((category) => category.type === "EXPENSE");
  }, [categories]);

  const incomeCategories = useMemo(() => {
    return categories.filter((category) => category.type === "INCOME");
  }, [categories]);

  const defaultCategories = useMemo(() => {
    return categories.filter((category) => category.isDefault);
  }, [categories]);

  // ======================================================
  // ADD
  // ======================================================

  const handleCategoryAdded = (newCategory) => {
    setCategories((prevCategories) => [newCategory, ...prevCategories]);

    setShowAddModal(false);
  };

  // ======================================================
  // EDIT
  // ======================================================

  const handleEdit = (category) => {
    setOpenMenu(null);
    setSelectedCategory(category);
    setShowEditModal(true);
  };

  const handleCategoryUpdated = (updatedCategory) => {
    setCategories((prevCategories) =>
      prevCategories.map((category) =>
        category._id === updatedCategory._id ? updatedCategory : category,
      ),
    );

    setSelectedCategory(null);
    setShowEditModal(false);
  };

  // ======================================================
  // DELETE
  // ======================================================

  const handleDelete = (category) => {
    setOpenMenu(null);
    setCategoryToDelete(category);
    setShowDeleteModal(true);
  };

  const handleCategoryDeleted = (categoryId) => {
    setCategories((prevCategories) =>
      prevCategories.filter((category) => category._id !== categoryId),
    );

    setCategoryToDelete(null);
    setShowDeleteModal(false);
  };

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <PageLayout
        title="Categories"
        subtitle="Manage your income and expense categories"
      >
        <div className="flex min-h-[300px] items-center justify-center sm:min-h-[400px]">
          <div className="flex items-center gap-2.5 text-xs text-slate-500 sm:gap-3 sm:text-sm">
            <Loader2
              size={18}
              className="animate-spin sm:h-[22px] sm:w-[22px]"
            />

            <p>Loading categories...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  // ======================================================
  // ERROR
  // ======================================================

  if (error) {
    return (
      <PageLayout
        title="Categories"
        subtitle="Manage your income and expense categories"
      >
        <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-center sm:rounded-2xl sm:p-5">
          <p className="text-xs font-medium text-red-600 sm:text-sm">{error}</p>

          <button
            type="button"
            onClick={loadCategories}
            className="mt-3 rounded-lg bg-red-600 px-3.5 py-2 text-xs font-medium text-white hover:bg-red-700 sm:px-4 sm:text-sm"
          >
            Try Again
          </button>
        </div>
      </PageLayout>
    );
  }

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <PageLayout
      title="Categories"
      subtitle="Manage your income and expense categories"
    >
      {/* IMPORTANT:
          No overflow-hidden here.
          This allows the Edit/Delete dropdown to appear outside.
      */}
      <div className="mx-auto w-full max-w-[1400px] space-y-3 sm:space-y-4 lg:space-y-5">
        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="min-w-0">
            <h2 className="text-base font-bold text-slate-900 sm:text-lg">
              Your Categories
            </h2>

            <p className="mt-0.5 text-[10px] text-slate-500 sm:mt-1 sm:text-sm">
              Organize your transactions by category
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-purple-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-purple-700 active:bg-purple-800 sm:w-auto sm:gap-2 sm:rounded-xl sm:px-5 sm:py-3 sm:text-sm"
          >
            <Plus size={16} />
            Add Category
          </button>
        </div>

        {/* ==================================================
            SUMMARY CARDS
        ================================================== */}

        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          <SummaryCard
            title="Total Categories"
            value={categories.length}
            icon={<Tags size={18} />}
            iconClass="bg-violet-50 text-violet-600"
          />

          <SummaryCard
            title="Expense Categories"
            value={expenseCategories.length}
            icon={<ArrowUpRight size={18} />}
            iconClass="bg-red-50 text-red-600"
          />

          <SummaryCard
            title="Income Categories"
            value={incomeCategories.length}
            icon={<ArrowDownLeft size={18} />}
            iconClass="bg-emerald-50 text-emerald-600"
          />

          <SummaryCard
            title="Default Categories"
            value={defaultCategories.length}
            icon={<Tags size={18} />}
            iconClass="bg-blue-50 text-blue-600"
          />
        </div>

        {/* ==================================================
            EMPTY STATE
        ================================================== */}

        {categories.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-10 text-center sm:rounded-2xl sm:px-6 sm:py-16">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 text-violet-600 sm:h-16 sm:w-16 sm:rounded-2xl">
              <Tags size={23} className="sm:h-7 sm:w-7" />
            </div>

            <h3 className="mt-4 text-sm font-semibold text-slate-900 sm:mt-5 sm:text-lg">
              No categories found
            </h3>

            <p className="mx-auto mt-1.5 max-w-md text-[11px] leading-5 text-slate-500 sm:mt-2 sm:text-sm sm:leading-6">
              Create your first category to organize your expenses and income.
            </p>

            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-violet-700 sm:mt-5 sm:gap-2 sm:px-4 sm:text-sm"
            >
              <Plus size={16} />
              Add Category
            </button>
          </div>
        ) : (
          <>
            {/* ==================================================
                CATEGORY SECTION
            ================================================== */}

            <div className="rounded-xl border border-slate-200 bg-white shadow-sm sm:rounded-2xl">
              {/* SECTION HEADER */}

              <div className="flex items-center justify-between border-b border-slate-100 px-3 py-3 sm:px-5 sm:py-4">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 sm:text-base">
                    All Categories
                  </h2>

                  <p className="mt-0.5 text-[10px] text-slate-500 sm:text-xs">
                    {categories.length}{" "}
                    {categories.length === 1 ? "category" : "categories"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-1 text-[11px] font-semibold text-purple-600 sm:gap-1.5 sm:text-sm"
                >
                  <Plus size={14} />

                  <span className="hidden sm:inline">Add Category</span>
                </button>
              </div>

              {/* ==================================================
                  CATEGORY LIST
              ================================================== */}

              <div className="divide-y divide-slate-100">
                {categories.map((category) => {
                  const isExpense = category.type === "EXPENSE";

                  const categoryColor = category.color || "#8b5cf6";

                  return (
                    <div
                      key={category._id}
                      className="relative flex min-h-[58px] items-center gap-2.5 px-3 py-2 sm:min-h-[64px] sm:gap-3 sm:px-5 sm:py-2.5"
                    >
                      {/* ICON */}

                      <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-lg sm:h-10 sm:w-10 sm:rounded-xl sm:text-xl"
                        style={{
                          backgroundColor: `${categoryColor}15`,
                          color: categoryColor,
                        }}
                      >
                        {category.icon || "🏷️"}
                      </div>

                      {/* NAME */}

                      <div className="min-w-0 flex-1">
                        <div className="flex min-w-0 items-center gap-2">
                          <h3 className="truncate text-xs font-semibold text-slate-900 sm:text-sm">
                            {category.name}
                          </h3>

                          {category.isDefault && (
                            <span className="hidden shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-medium text-slate-500 sm:inline">
                              Default
                            </span>
                          )}
                        </div>
                      </div>

                      {/* TYPE */}

                      <div className="shrink-0">
                        {isExpense ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-1 text-[9px] font-semibold text-red-600 sm:px-2.5 sm:text-xs">
                            <ArrowUpRight size={11} />
                            <span>Expense</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-semibold text-emerald-600 sm:px-2.5 sm:text-xs">
                            <ArrowDownLeft size={11} />
                            <span>Income</span>
                          </span>
                        )}
                      </div>

                      {/* ==================================================
                          MENU
                      ================================================== */}

                      <div className="relative z-40 shrink-0">
                        <button
                          type="button"
                          onClick={() =>
                            setOpenMenu(
                              openMenu === category._id ? null : category._id,
                            )
                          }
                          title="More options"
                          aria-label="More category options"
                          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 sm:p-2"
                        >
                          <MoreVertical size={16} />
                        </button>

                        {openMenu === category._id && (
                          <div
                            className="
                              absolute
                              right-0
                              top-full
                              z-[9999]
                              mt-1
                              w-32
                              rounded-lg
                              border
                              border-slate-200
                              bg-white
                              py-1
                              shadow-xl
                            "
                          >
                            {/* EDIT */}

                            <button
                              type="button"
                              onClick={() => handleEdit(category)}
                              className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-xs font-medium text-blue-600 transition hover:bg-blue-50 sm:text-sm"
                            >
                              <Pencil size={14} />
                              Edit
                            </button>

                            {/* DELETE */}

                            <button
                              type="button"
                              onClick={() => handleDelete(category)}
                              className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-xs font-medium text-red-600 transition hover:bg-red-50 sm:text-sm"
                            >
                              <Trash2 size={14} />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* ==================================================
            ADD MODAL
        ================================================== */}

        {showAddModal && (
          <AddCategoryModal
            onClose={() => setShowAddModal(false)}
            onSuccess={handleCategoryAdded}
          />
        )}

        {/* ==================================================
            EDIT MODAL
        ================================================== */}

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

        {/* ==================================================
            DELETE MODAL
        ================================================== */}

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
      </div>
    </PageLayout>
  );
};

// ======================================================
// SUMMARY CARD
// ======================================================

const SummaryCard = ({ title, value, icon, iconClass }) => {
  return (
    <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:rounded-2xl sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-[9px] text-slate-500 sm:text-sm">
            {title}
          </p>

          <p className="mt-1 text-lg font-bold text-slate-900 sm:mt-2 sm:text-2xl">
            {value}
          </p>
        </div>

        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full sm:h-11 sm:w-11 ${iconClass}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
};

export default Categories;
