const express = require('express');
const router = express.Router();
const controller = require('../app/controllers');
const { auth } = require('../utils/jwt');
const multer = require('multer')();

router.get('/mail-reset-password', (req, res) => {
  res.render('forgotPassword.ejs');
});
router.get('/reset-password', (req, res) => {
  const { email, token } = req.query;
  res.render('newPassword.ejs', { email, token });
});
router.put('/v1/users/mail-reset-password', controller.users.mailResetPassword);
router.put('/v1/users/reset-password', controller.users.resetPassword);

router.get('/v1/users', controller.users.getUsers);
router.post('/v1/users', multer.single('image'), controller.users.createUser);
router.get('/v1/users/:id', auth, controller.users.getUserById);
router.delete('/v1/users/:id', auth, controller.users.deleteUser);
router.put('/v1/users/:id', auth, controller.users.updateUser);
router.put(
  '/v1/profile',
  auth,
  multer.single('image'),
  controller.users.updateProfileAndImage
);
router.delete('/v1/profile', auth, controller.users.deleteProfileImage);

module.exports = router;
