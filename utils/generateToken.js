const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const generateResetToken = async () => {
  const resetToken = crypto.randomBytes(32).toString('hex');
  const hash = await bcrypt.hashSync(resetToken, 10);
  return hash;
};

const compareToken = async (token, hashedToken) => {
  const isCorrect = await bcrypt.compare(token, hashedToken);
  return isCorrect;
};

module.exports = { generateResetToken, compareToken };
