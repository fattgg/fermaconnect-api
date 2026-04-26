const usersService = require("../services/users.service");

const savePushToken = async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Push token is required" });
    }

    const result = await usersService.savePushToken(req.user.id, token);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

module.exports = { savePushToken };
