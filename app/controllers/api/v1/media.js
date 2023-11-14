const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const qr = require('node-qr-image');
const imagekit = require('../../../../utils/imagekit');

const uploadImage = (req, res) => {
  const imageUrl = `${req.protocol}://${req.get('host')}/images/${
    req.file.filename
  }`;

  return res.status(200).json({
    status: 'success',
    data: {
      image_url: imageUrl,
    },
  });
};

const uploadVideo = async (req, res) => {
  const videoUrl = `${req.protocol}://${req.get('host')}/videos/${
    req.file.filename
  }`;

  return res.status(200).json({
    status: 'success',
    data: {
      video_url: videoUrl,
    },
  });
};

const uploadDocument = async (req, res) => {
  const documentUrl = `${req.protocol}://${req.get('host')}/files/${
    req.file.filename
  }`;

  return res.status(200).json({
    status: 'success',
    data: {
      document_url: documentUrl,
    },
  });
};

const generateQRCode = async (req, res) => {
  const { url } = req.body;
  const qrCode = qr.image(url, {
    type: 'png',
    ec_level: 'H',
  });
  res.setHeader('Content-type', 'image/png');
  qrCode.pipe(res);
};

const imageKitUpload = async (req, res) => {
  try {
    const stringFile = req.file.buffer.toString('base64');

    const imageKitUpload = await imagekit.upload({
      file: stringFile,
      fileName: req.file.originalname,
    });

    return res.status(200).json({
      status: 'success',
      data: {
        name: imageKitUpload.name,
        url: imageKitUpload.url,
        type: imageKitUpload.fileType,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

module.exports = {
  uploadImage,
  uploadVideo,
  uploadDocument,
  generateQRCode,
  imageKitUpload,
};
