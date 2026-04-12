const register = async (data) => {
  return { message: 'register – coming in Step 2.3' };
};

const login = async (data) => {
  return { message: 'login – coming in Step 2.4' };
};

const getMe = async (id) => {
  return { message: 'getMe – coming in Step 2.5' };
};

module.exports = { register, login, getMe };