import axiosInstance from "./axios";

export const getCategories = async () => {
  const response = await axiosInstance.get("/categories");
  return response.data;
};

export const createCategory = async (data) => {
  const response = await axiosInstance.post("/categories", data);
  return response.data;
};

export const updateCategory = async (id, data) => {
  const response = await axiosInstance.put(`/categories/${id}`, data);

  return response.data;
};

export const deleteCategory = async (id) => {
  const response = await axiosInstance.delete(`/categories/${id}`);

  return response.data;
};
