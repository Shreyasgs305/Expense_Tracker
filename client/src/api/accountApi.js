import axiosInstance from "./axios";

// Get all accounts
export const getAccounts = async () => {
  const response = await axiosInstance.get("/accounts");

  return response.data;
};

// Create account
export const createAccount = async (data) => {
  const response = await axiosInstance.post("/accounts", data);

  return response.data;
};

// Update account name/type
export const updateAccount = async (id, data) => {
  const response = await axiosInstance.put(`/accounts/${id}`, data);

  return response.data;
};

// Update account balance
export const updateAccountBalance = async (id, balance) => {
  const response = await axiosInstance.put(`/accounts/${id}/balance`, {
    balance,
  });

  return response.data;
};

// Delete account
export const deleteAccount = async (id) => {
  const response = await axiosInstance.delete(`/accounts/${id}`);

  return response.data;
};
