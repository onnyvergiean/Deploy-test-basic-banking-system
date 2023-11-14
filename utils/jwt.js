const jwt = require('jsonwebtoken');
let { JWT_SECRET_KEY } = process.env;
async function auth(req, res, next) {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).json({
      status: 'failed',
      message: "you're not authorized!",
      data: null,
    });
  }

  let token = authorization;

  if (authorization.startsWith('Bearer ')) {
    token = authorization.split(' ')[1];
  }

  jwt.verify(token, JWT_SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({
        status: 'failed',
        message: "you're not authorized!",
        err: err.message,
        data: null,
      });
    }
    req.user = decoded;
    next();
  });
}
async function JWTsign(user) {
  const token = jwt.sign(user, JWT_SECRET_KEY, { expiresIn: '1h' });
  return token;
}
module.exports = {
  auth,
  JWTsign,
};
