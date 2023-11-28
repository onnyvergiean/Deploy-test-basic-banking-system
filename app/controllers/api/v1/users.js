const fs = require('fs');
const {
  PrismaClient,
  PrismaClientKnownRequestError,
} = require('@prisma/client');
const path = require('path');
const defaultImageUrl = path.join(
  __dirname,
  '../../../../public/images/default_image.png'
);
const { DateTime } = require('luxon');
const imageKit = require('../../../../utils/imagekit');
const { encryptPassword, checkPassword } = require('../../../../utils/auth');
const { generateResetToken } = require('../../../../utils/generateToken');
const {
  sendRegistrationEmail,
  sendResetPasswordEmail,
  sendSuccessResetEmail,
} = require('../../../../utils/mailer');
const prisma = new PrismaClient();

const createUser = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({
        status: 'error',
        code: 400,
        message: 'Bad Request: Request body is empty',
      });
    }
    const {
      name,
      email,
      password,
      identity_type = null,
      identity_number = null,
      address = null,
    } = req.body;
    let identityNumber = identity_number ? parseInt(identity_number) : null;

    const user = await prisma.user.findFirst({
      where: { email },
    });

    if (user) {
      return res.status(400).json({
        status: 'error',
        code: 400,
        message: 'Email sudah terdaftar!',
      });
    }
    let profile;
    if (req.file) {
      let stringFile = req.file.buffer.toString('base64');
      const imageUpload = await imageKit.upload({
        file: stringFile,
        fileName: req.file.originalname,
      });

      profile = {
        identity_type,
        identity_number: identityNumber,
        address,
        image: imageUpload.url,
        imageId: imageUpload.fileId,
      };
    } else {
      const defaultImageUpload = await imageKit.upload({
        file: fs.readFileSync(defaultImageUrl, 'base64'),
        fileName: defaultImageUrl,
      });

      profile = {
        identity_type,
        identity_number: identityNumber,
        address,
        image: defaultImageUpload.url,
        imageId: defaultImageUpload.fileId,
      };
    }

    const createUser = await prisma.user.create({
      data: {
        name,
        email,
        password: await encryptPassword(password),
        profile: {
          create: profile,
        },
      },
      include: {
        profile: true,
      },
    });

    await sendRegistrationEmail(email, name);

    return res.status(201).json({
      status: 'success',
      code: 200,
      message: 'Data ditambahkan!',
      data: createUser,
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      code: 500,
      message: 'Internal server error',
    });
  }
};

const getUsers = async (req, res) => {
  try {
    const { search } = req.query;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const users = await prisma.user.findMany({
      where: {
        name: {
          contains: search || '',
          mode: 'insensitive',
        },
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    if (!users || users.length === 0) {
      return res.status(200).json({
        status: 'success',
        code: 200,
        message: 'Data not found',
      });
    }

    return res.status(200).json({
      status: 'success',
      code: 200,
      message: 'Data ditemukan!',
      data: users,
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      code: 500,
      message: 'Internal server error',
    });
  }
};

const getUserById = async (req, res) => {
  const id = parseInt(req.params.id);
  const authenticatedUserId = req.user.id;

  try {
    if (isNaN(id)) {
      return res.status(400).json({
        status: 'error',
        code: 400,
        message: 'Bad Request : ID must be a number',
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id,
      },
      include: {
        profile: true,
      },
    });

    if (!user) {
      return res.status(200).json({
        status: 'success',
        code: 200,
        message: 'User not found',
      });
    }

    if (user.id !== authenticatedUserId) {
      return res.status(401).json({
        status: 'error',
        code: 401,
        message: 'Unauthorized: You do not have permission to access this user',
      });
    }

    delete user.password;
    return res.status(200).json({
      status: 'success',
      code: 200,
      message: 'Data ditemukan!',
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      code: 500,
      message: 'Internal server error',
    });
  }
};

const updateUser = async (req, res) => {
  const id = parseInt(req.params.id);
  const authenticatedUserId = req.user.id;
  const { name, email, password } = req.body;

  try {
    if (isNaN(id)) {
      return res.status(400).json({
        status: 'error',
        code: 400,
        message: 'Bad Request : ID must be a number',
      });
    }

    if (id !== authenticatedUserId) {
      return res.status(401).json({
        status: 'error',
        code: 401,
        message: 'Unauthorized: You do not have permission to access this user',
      });
    }

    const updateData = {
      name,
      email,
    };

    if (password) {
      updateData.password = await encryptPassword(password);
    }

    const updateUser = await prisma.user.update({
      where: {
        id,
      },
      data: updateData,
    });

    delete updateUser.password;
    return res.status(200).json({
      status: 'success',
      code: 200,
      message: 'User updated successfully',
      data: updateUser,
    });
  } catch (error) {
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      return res.status(404).json({
        status: 'error',
        code: 404,
        message: 'User not found',
      });
    } else {
      return res.status(500).json({
        status: 'error',
        code: 500,
        message: 'Internal server error',
      });
    }
  }
};

const deleteUser = async (req, res) => {
  const id = parseInt(req.params.id);
  const authenticatedUserId = req.user.id;
  try {
    if (isNaN(id)) {
      return res.status(400).json({
        status: 'error',
        code: 400,
        message: 'Bad Request : ID must be a number',
      });
    }

    if (id !== authenticatedUserId) {
      return res.status(401).json({
        status: 'error',
        code: 401,
        message: 'Unauthorized: You do not have permission to access this user',
      });
    }

    const deletedUser = await prisma.user.delete({
      where: {
        id,
      },
    });
    delete deletedUser.password;
    return res.status(200).json({
      status: 'success',
      code: 200,
      message: 'User deleted successfully',
      data: deletedUser,
    });
  } catch (error) {
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      return res.status(404).json({
        status: 'error',
        code: 404,
        message: 'User not found',
      });
    } else {
      return res.status(500).json({
        status: 'error',
        code: 500,
        message: 'Internal server error',
      });
    }
  }
};

const updateProfileAndImage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { identity_type, identity_number, address } = req.body;
    let identityNumber = identity_number
      ? parseInt(identity_number)
      : undefined;
    let imageUpload, imageId;
    if (req.file) {
      const stringFile = req.file.buffer.toString('base64');
      imageUpload = await imageKit.upload({
        file: stringFile,
        fileName: req.file.originalname,
      });
      imageId = imageUpload && imageUpload.fileId;
    }

    const currentProfile = await prisma.profile.findUnique({
      where: {
        userId,
      },
    });

    const updatedProfile = await prisma.profile.update({
      where: {
        userId,
      },
      data: {
        identity_type,
        identity_number: identityNumber,
        address,
        image: imageUpload && imageUpload.url,
        imageId: imageId || null,
      },
    });

    if (currentProfile.imageId && imageUpload) {
      await imageKit.deleteFile(currentProfile.imageId);
    }

    if (!updatedProfile) {
      return res.status(401).json({
        status: 'error',
        code: 401,
        message:
          'Unauthorized: You do not have permission to update this profile',
      });
    }

    return res.status(200).json({
      status: 'success',
      code: 200,
      message: 'Profile information and image updated successfully',
      data: updatedProfile,
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      code: 500,
      message: 'Internal server error',
    });
  }
};

const deleteProfileImage = async (req, res) => {
  try {
    const userId = req.user.id;

    const userProfile = await prisma.profile.findUnique({
      where: {
        userId,
      },
    });

    if (userProfile && userProfile.image) {
      await imageKit.deleteFile(userProfile.imageId);
    }

    const defaultImageUpload = await imageKit.upload({
      file: fs.readFileSync(defaultImageUrl),
      fileName: defaultImageUrl,
    });

    const updatedProfile = await prisma.profile.update({
      where: {
        userId,
      },
      data: {
        image: defaultImageUpload.url,
        imageId: defaultImageUpload.fileId,
      },
    });

    return res.status(200).json({
      status: 'success',
      code: 200,
      message: 'Profile image deleted, set to default image successfully',
      data: updatedProfile,
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      code: 500,
      message: 'Internal server error',
    });
  }
};

const mailResetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const resetToken = await generateResetToken();

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return res.status(404).json({
        status: 'error',
        code: 404,
        message: 'User not found',
      });
    }

    const resetTokenExpiry = DateTime.local()
      .setZone('Asia/Jakarta')
      .plus({ hours: 1 });

    await prisma.user.update({
      where: {
        email,
      },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    await sendResetPasswordEmail(email, resetToken, user.name);

    return res.status(200).json({
      status: 'success',
      code: 200,
      message: 'Reset password email sent successfully',
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      code: 500,
      message: 'Internal server error',
    });
  }
};

const resetPassword = async (req, res) => {
  const { password, email, token } = req.body;
  if (!email || !token || !password) {
    ({ email, token } = req.query);
  }
  try {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return res.status(404).json({
        status: 'error',
        code: 404,
        message: 'User not found',
      });
    }

    if (user.resetToken !== token) {
      return res.status(400).json({
        status: 'error',
        code: 400,
        message: 'Bad Request: Token is invalid',
      });
    }

    const isTokenExpired =
      DateTime.local()
        .setZone('Asia/Jakarta')
        .diff(DateTime.fromISO(user.resetTokenExpiry), 'hours').hours > 0;

    if (isTokenExpired) {
      return res.status(400).json({
        status: 'error',
        code: 400,
        message: 'Bad Request: Token is expired please request a new one',
      });
    }

    await prisma.user.update({
      where: {
        email,
      },
      data: {
        password: await encryptPassword(password),
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    await sendSuccessResetEmail(email, user.name);

    return res.status(200).json({
      status: 'success',
      code: 200,
      message: 'Password reset successfully',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 'error',
      code: 500,
      message: 'Internal server error',
    });
  }
};

module.exports = {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateProfileAndImage,
  deleteProfileImage,
  mailResetPassword,
  resetPassword,
};
