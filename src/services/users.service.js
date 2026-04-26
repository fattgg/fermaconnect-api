const db = require("../db");

const savePushToken = async (userId, token) => {
  await db.query("UPDATE users SET push_token = $1 WHERE id = $2", [
    token,
    userId,
  ]);
  return { success: true };
};

module.exports = { savePushToken };
