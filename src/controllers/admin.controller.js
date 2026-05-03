const adminService = require("../services/admin.service");

const getStats = async (req, res, next) => {
  try {
    const result = await adminService.getStats();
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

const getVerifications = async (req, res, next) => {
  try {
    const result = await adminService.getVerifications();
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

const updateVerification = async (req, res, next) => {
  try {
    const { status, admin_note } = req.body;
    const result = await adminService.updateVerification(
      req.params.id,
      status,
      admin_note,
    );
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const { role } = req.query;
    const result = await adminService.getUsers(role);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getStats,
  getVerifications,
  updateVerification,
  getUsers,
};