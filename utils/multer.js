const multer = require('multer');
const path = require('path');

const filename = (req, file, cb) => {
  const fileName = Date.now() + path.extname(file.originalname);
  cb(null, fileName);
};

const generateStorage = (destination) => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, destination);
    },
    filename,
  });
};

const image = multer({
  storage: generateStorage('./public/images'),
  fileFilter: (req, file, cb) => {
    const allowedMimeType = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowedMimeType.includes(file.mimetype)) {
      cb(null, true);
    } else {
      const err = new Error(`Only ${allowedMimeType.join(', ')} are allowed`);
      cb(err, false);
    }
  },
  onError: (err, next) => {
    next(err);
  },
});

const video = multer({
  storage: generateStorage('./public/videos'),
  fileFilter: (req, file, cb) => {
    const allowedMimeType = ['video/mp4', 'video/mkv', 'video/avi'];
    if (allowedMimeType.includes(file.mimetype)) {
      cb(null, true);
    } else {
      const err = new Error(`Only ${allowedMimeType.join(', ')} are allowed`);
      cb(err, false);
    }
  },
  onError: (err, next) => {
    next(err);
  },
});

const document = multer({
  storage: generateStorage('./public/files'),
  fileFilter: (req, file, callback) => {
    const allowedMimeType = ['application/pdf', 'application/vnd.ms-excel'];

    if (allowedMimeType.includes(file.mimetype)) {
      callback(null, true);
    } else {
      const err = new Error(
        `Only ${allowedMimeType.join(', ')} allowed to upload`
      );
      callback(err, false);
    }
  },
  onError: (err, next) => {
    next(err);
  },
});

module.exports = {
  image,
  video,
  document,
};
