function sendSuccess(res, data, message) {
  const payload = {
    success: true,
    data
  };

  if (message) {
    payload.message = message;
  }

  res.json(payload);
}

module.exports = {
  sendSuccess
};
