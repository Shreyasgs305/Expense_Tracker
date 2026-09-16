import axiosInstance from "./axios";

// Get all expenses
export const getExpenses = async (params = {}) => {
  const response = await axiosInstance.get("/expenses", {
    params,
  });

  return response.data;
};

// Get single expense
export const getExpenseById = async (id) => {
  const response = await axiosInstance.get(`/expenses/${id}`);

  return response.data;
};

// Create expense
export const createExpense = async (data) => {
  const response = await axiosInstance.post("/expenses", data);

  return response.data;
};

// Update expense
export const updateExpense = async (id, data) => {
  const response = await axiosInstance.put(`/expenses/${id}`, data);

  return response.data;
};

// Delete expense
export const deleteExpense = async (id) => {
  const response = await axiosInstance.delete(`/expenses/${id}`);

  return response.data;
};
// Create credit card payment
export const createCreditCardPayment = async (paymentData) => {
  const response = await axiosInstance.post(
    "/expenses/credit-card-payment",
    paymentData,
  );

  return response.data;
};
