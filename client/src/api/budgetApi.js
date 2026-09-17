import axiosInstance from "./axios";

// Get all budgets
export const getBudgets = async (params = {}) => {
  const response = await axiosInstance.get("/budgets", {
    params,
  });

  return response.data;
};

// Get single budget
export const getBudgetById = async (id) => {
  const response = await axiosInstance.get(`/budgets/${id}`);

  return response.data;
};

// Create budget
export const createBudget = async (budgetData) => {
  const response = await axiosInstance.post("/budgets", budgetData);

  return response.data;
};

// Update budget
export const updateBudget = async (id, budgetData) => {
  const response = await axiosInstance.put(`/budgets/${id}`, budgetData);

  return response.data;
};

// Delete budget
export const deleteBudget = async (id) => {
  const response = await axiosInstance.delete(`/budgets/${id}`);

  return response.data;
};

// Get budget status
export const getBudgetStatus = async (id) => {
  const response = await axiosInstance.get(`/budgets/${id}/status`);

  return response.data;
};
