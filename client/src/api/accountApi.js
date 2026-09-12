import axiosInstance from "./axios";

export const getAccounts = async () => {
  const response = await axiosInstance.get("/accounts");
  return response.data;
};

export const createAccount = async (data) => {
  const response = await axiosInstance.post("/accounts", data);
  return response.data;
};

export const updateAccount = async (id, data) => {
  const response = await axiosInstance.put(`/accounts/${id}`, data);

  return response.data;
};

export const deleteAccount = async (id) => {
  const response = await axiosInstance.delete(`/accounts/${id}`);

  return response.data;
};
