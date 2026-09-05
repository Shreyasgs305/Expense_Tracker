const registerUser = (req, res) => {
  res.json({
    success: true,
    message: "Registered succesfully",
  });
};

const loginUser = (req, res) => {
  res.json({
    success: true,
    message: "login succesfully",
  });
};
const getUser = (req, res) => {
  res.json({
    success: true,
    message: "user",
  });
};

const deleteUser = (req, res) => {
  res.json({
    success: true,
    message: "deleted user",
  });
};
module.exports = { registerUser, loginUser, getUser, deleteUser };
