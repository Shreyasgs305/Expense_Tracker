import axiosInstance from "./axios";

// Create loan
export const createLoan = async (data) => {
  const response = await axiosInstance.post("/loans", data);

  return response.data;
};

// Get all loans
export const getLoans = async () => {
  const response = await axiosInstance.get("/loans");

  return response.data;
};

// Get single loan
export const getLoanById = async (id) => {
  const response = await axiosInstance.get(`/loans/${id}`);

  return response.data;
};

// Record repayment
export const recordRepayment = async (id, amount) => {
  const response = await axiosInstance.post(`/loans/${id}/repayment`, {
    amount,
  });

  return response.data;
};

// Delete loan
export const deleteLoan = async (id) => {
  const response = await axiosInstance.delete(`/loans/${id}`);

  return response.data;
};
