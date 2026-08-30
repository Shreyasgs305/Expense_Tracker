const getExpenses = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: "Expenses fetched successfully",
      expenses: [],
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch expenses",
    });
  }
};

const addExpenses = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: "Expense added successfully",
      expenses: [],
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to add expenses",
    });
  }
};
module.exports = { getExpenses, addExpenses };
