import axiosInstance from "./axios";

export const register = async (data) => {
  const response = await axiosInstance.post("/auth/register", data);

  return response.data;
};

export const login = async (data) => {
  const response = await axiosInstance.post("/auth/login", data);

  return response.data;
};

export const getMe = async () => {
  const response = await axiosInstance.get("/auth/me");

  return response.data;
};

export const updateProfile = async (data) => {
  const response = await axiosInstance.put("/auth/profile", data);

  return response.data;
};

export const changePassword = async (data) => {
  const response = await axiosInstance.put("/auth/change-password", data);

  return response.data;
};

export const deleteAccount = async () => {
  const response = await axiosInstance.delete("/auth/account");

  return response.data;
};
