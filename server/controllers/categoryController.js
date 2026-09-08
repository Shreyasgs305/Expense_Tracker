const Category = require("../models/Category");
const Transaction = require("../models/Transaction");
const getCategories = async (req, res) => {
  try {
    // Get logged-in user's ID
    const userId = req.user.id;

    // Get type from query parameter
    const { type } = req.query;

    // Build query
    const query = {
      userId: userId,
    };

    // Optional filtering
    if (type) {
      const categoryType = type.toUpperCase();

      // Validate type
      if (!["EXPENSE", "INCOME"].includes(categoryType)) {
        return res.status(400).json({
          success: false,
          message: "Type must be EXPENSE or INCOME",
        });
      }

      query.type = categoryType;
    }

    // Find categories belonging only to logged-in user
    const categories = await Category.find(query).sort({
      name: 1,
    });

    return res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Get categories error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const getCategoryById = async (req, res) => {
  try {
    // Get logged-in user's ID
    const userId = req.user.id;

    // Get category ID from URL
    const categoryId = req.params.id;

    // Find category and verify ownership
    const category = await Category.findOne({
      _id: categoryId,
      userId: userId,
    });

    // Category not found
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Return category
    return res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error("Get category error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
// POST /api/categories
const createCategory = async (req, res) => {
  try {
    // 1. Authenticate user
    const userId = req.user.id;

    // 2. Get data from request body
    const { name, type, icon, color } = req.body;

    // 3. Validate name
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    // 4. Validate type
    if (!type) {
      return res.status(400).json({
        success: false,
        message: "Category type is required",
      });
    }

    const categoryType = type.toUpperCase();

    if (!["EXPENSE", "INCOME"].includes(categoryType)) {
      return res.status(400).json({
        success: false,
        message: "Type must be EXPENSE or INCOME",
      });
    }

    // 5. Create category
    // userId comes from JWT, NOT from req.body
    const category = new Category({
      userId: userId,
      name: name.trim(),
      type: categoryType,
      icon: icon || null,
      color: color || null,
    });

    // 6. Save category
    await category.save();

    // 7. Return created category
    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category,
    });
  } catch (error) {
    console.error("Create category error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
// PUT /api/categories/:id
const updateCategory = async (req, res) => {
  try {
    // 1. Authenticate user
    const userId = req.user.id;

    // 2. Get category ID
    const categoryId = req.params.id;

    // 3. Get only allowed fields
    const { name, icon, color } = req.body;

    // Validate name if provided
    if (name !== undefined && !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category name cannot be empty",
      });
    }

    // 4. Find category using ID + logged-in user's ID
    const category = await Category.findOne({
      _id: categoryId,
      userId: userId,
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // 5. Update allowed fields only
    if (name !== undefined) {
      category.name = name.trim();
    }

    if (icon !== undefined) {
      category.icon = icon;
    }

    if (color !== undefined) {
      category.color = color;
    }

    // 6. Save updated category
    await category.save();

    // 7. Return updated category
    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: category,
    });
  } catch (error) {
    console.error("Update category error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
const deleteCategory = async (req, res) => {
  try {
    // 1. Authenticate user
    const userId = req.user.id;

    // 2. Get category ID
    const categoryId = req.params.id;

    // 3. Find category belonging to logged-in user
    const category = await Category.findOne({
      _id: categoryId,
      userId: userId,
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // 4. Check whether transactions use this category
    const transactionCount = await Transaction.countDocuments({
      categoryId: categoryId,
      userId: userId,
    });

    // 5. Don't delete if transactions exist
    if (transactionCount > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete category because transactions are associated with it.",
      });
    }

    // 6. Delete category
    await Category.deleteOne({
      _id: categoryId,
      userId: userId,
    });

    // 7. Return response
    return res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Delete category error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
