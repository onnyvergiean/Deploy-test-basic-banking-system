const {
  PrismaClient,
  PrismaClientKnownRequestError,
} = require('@prisma/client');

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

    const { profile, ...data } = req.body;

    const user = await prisma.user.create({
      data: {
        ...data,
        profile: {
          create: profile,
        },
      },
    });

    return res.status(201).json({
      status: 'success',
      code: 200,
      message: 'Data ditambahkan!',
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
  const { name, email, password } = req.body;

  try {
    if (isNaN(id)) {
      return res.status(400).json({
        status: 'error',
        code: 400,
        message: 'Bad Request : ID must be a number',
      });
    }

    const updateUser = await prisma.user.update({
      where: {
        id,
      },
      data: {
        name,
        email,
        password,
      },
    });

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
  try {
    if (isNaN(id)) {
      return res.status(400).json({
        status: 'error',
        code: 400,
        message: 'Bad Request : ID must be a number',
      });
    }
    const deletedUser = await prisma.user.delete({
      where: {
        id,
      },
    });

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

module.exports = {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
};
