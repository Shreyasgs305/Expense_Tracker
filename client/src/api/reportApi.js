import axiosInstance from "./axios";

// ==========================================
// DASHBOARD REPORT
// ==========================================

export const getDashboardReport = async () => {
  const response = await axiosInstance.get("/reports/dashboard");

  return response.data;
};

// ==========================================
// SUMMARY REPORT
// ==========================================

export const getSummaryReport = async (params = {}) => {
  const response = await axiosInstance.get("/reports/summary", {
    params,
  });

  return response.data;
};

// ==========================================
// CATEGORY REPORT
// ==========================================

export const getCategoryReport = async (params = {}) => {
  const response = await axiosInstance.get("/reports/category", {
    params,
  });

  return response.data;
};

// ==========================================
// MONTHLY REPORT
// ==========================================

export const getMonthlyReport = async (params = {}) => {
  const response = await axiosInstance.get("/reports/monthly", {
    params,
  });

  return response.data;
};

// ==========================================
// ACCOUNT REPORT
// ==========================================

export const getAccountReport = async (params = {}) => {
  const response = await axiosInstance.get("/reports/account", {
    params,
  });

  return response.data;
};

// ==========================================
// TRENDS REPORT
// ==========================================

export const getTrendsReport = async (params = {}) => {
  const response = await axiosInstance.get("/reports/trends", {
    params,
  });

  return response.data;
};
