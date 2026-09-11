import axiosInstance from "./axios";

export const getDashboard = async () => {
  const response = await axiosInstance.get("/reports/dashboard");

  return response.data;
};
