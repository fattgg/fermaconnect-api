const authenticate = (req, res, next) => {
  res.status(501).json({ message: 'authenticate middleware – coming in Step 2.5' });
};

module.exports = authenticate;