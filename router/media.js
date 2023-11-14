const express = require('express');
const router = express.Router();
const storage = require('../utils/multer');
const controller = require('../app/controllers');
const multer = require('multer')();

router.use('/images', express.static('public/images'));
router.use('/videos', express.static('public/videos'));
router.use('/files', express.static('public/files'));
router.post(
  '/v1/images',
  storage.image.single('image'),
  controller.media.uploadImage
);

router.post(
  '/v1/videos',
  storage.video.single('video'),
  controller.media.uploadVideo
);

router.post(
  '/v1/documents',
  storage.document.single('doc'),
  controller.media.uploadDocument
);

router.post('/v1/qrcode', controller.media.generateQRCode);

router.post(
  '/v1/upload/imagekit',
  multer.single('image'),
  controller.media.imageKitUpload
);

module.exports = router;
