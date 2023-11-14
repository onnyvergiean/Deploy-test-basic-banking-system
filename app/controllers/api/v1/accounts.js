const {
  PrismaClient,
  PrismaClientKnownRequestError,
} = require('@prisma/client');

const prisma = new PrismaClient();

const createAccount = async (req, res) => {
  const id = parseInt(req.params.id);
  const { bank_name, account_number, balance } = req.body;

  try {
    if (isNaN(id)) {
      return res.status(400).json({
        status: 'error',
        code: 400,
        message: 'Bad Request: User ID must be a number',
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) {
      return res.status(200).json({
        status: 'success',
        code: 200,
        message: 'User not found',
      });
    }

    const bankAccount = await prisma.bankAccount.create({
      data: {
        bank_name,
        account_number,
        balance,
        user: {
          connect: { id },
        },
      },
    });

    return res.status(201).json({
      status: 'success',
      code: 201,
      message: 'Bank account created!',
      data: bankAccount,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: 'error',
      code: 500,
      message: 'Internal server error',
    });
  }
};

const getAccounts = async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    if (isNaN(id)) {
      return res.status(400).json({
        status: 'error',
        code: 400,
        message: 'Bad Request: ID must be a number',
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id,
      },
      include: {
        bankAccount: true,
      },
    });

    if (!user) {
      return res.status(200).json({
        status: 'success',
        code: 200,
        message: 'User not found',
      });
    }

    const accounts = user.bankAccount;

    if (!accounts) {
      return res.status(200).json({
        status: 'success',
        code: 200,
        message: 'Accounts not found',
      });
    }

    return res.status(200).json({
      status: 'success',
      code: 200,
      message: 'Data ditemukan!',
      data: accounts,
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      code: 500,
      message: 'Internal server error',
    });
  }
};

const getDetailAccount = async (req, res) => {
  const accountId = parseInt(req.params.accountId);
  const userId = parseInt(req.params.id);

  try {
    if (isNaN(userId) || isNaN(accountId)) {
      return res.status(400).json({
        status: 'error',
        code: 400,
        message: 'Bad Request: user id and account id must be numbers',
      });
    }

    const account = await prisma.bankAccount.findUnique({
      where: {
        id: accountId,
        userId,
      },
    });

    if (!account) {
      return res.status(200).json({
        status: 'success',
        code: 200,
        message: 'account not found',
      });
    }

    return res.status(200).json({
      status: 'success',
      code: 200,
      message: 'Data ditemukan!',
      data: account,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: 'error',
      code: 500,
      message: 'Internal server error',
    });
  }
};

module.exports = {
  createAccount,
  getAccounts,
  getDetailAccount,
};
