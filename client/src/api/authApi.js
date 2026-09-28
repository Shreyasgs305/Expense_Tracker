import axiosInstance from "./axios";

// =========================
// REGISTER
// =========================

export const register = async (data) => {
  const response = await axiosInstance.post("/auth/register", data);

  return response.data;
};

// =========================
// LOGIN
// =========================

export const login = async (data) => {
  const response = await axiosInstance.post("/auth/login", data);

  return response.data;
};

// =========================
// SEND EMAIL OTP
// =========================

export const sendEmailVerificationOtp = async (data) => {
  const response = await axiosInstance.post("/auth/send-otp", data);

  return response.data;
};

// =========================
// VERIFY EMAIL OTP
// =========================

export const verifyEmailVerificationOtp = async (data) => {
  const response = await axiosInstance.post("/auth/verify-otp", data);

  return response.data;
};

// =========================
// GET CURRENT USER
// =========================

export const getMe = async () => {
  const response = await axiosInstance.get("/auth/me");

  return response.data;
};

// =========================
// UPDATE PROFILE
// =========================
export const sendPasswordResetOtp = async (data) => {
  const response = await axiosInstance.post("/auth/forgot-password", data);

  return response.data;
};

export const resetPassword = async (data) => {
  const response = await axiosInstance.post("/auth/reset-password", data);

  return response.data;
};
export const updateProfile = async (profileData) => {
  const response = await axiosInstance.put("/auth/profile", profileData);

  return response.data;
};

// =========================
// CHANGE PASSWORD
// =========================

export const changePassword = async (data) => {
  const response = await axiosInstance.put("/auth/change-password", data);

  return response.data;
};

// =========================
// DELETE ACCOUNT
// =========================

export const deleteAccount = async () => {
  const response = await axiosInstance.delete("/auth/account");

  return response.data;
};
