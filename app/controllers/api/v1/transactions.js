const {
  PrismaClient,
  PrismaClientKnownRequestError,
} = require('@prisma/client');

const prisma = new PrismaClient();

const createTransaction = async (req, res) => {
  const sourceAccountId = parseInt(req.body.sourceAccountId);
  const destinationAccountId = parseInt(req.body.destinationAccountId);
  const amount = parseFloat(req.body.amount);

  try {
    if (
      isNaN(sourceAccountId) ||
      isNaN(destinationAccountId) ||
      isNaN(amount)
    ) {
      return res.status(400).json({
        status: 'error',
        code: 400,
        message:
          'Bad Request: sourceAccountId, destinationAccountId, and amount must be numbers',
      });
    }

    if (sourceAccountId === destinationAccountId) {
      return res.status(400).json({
        status: 'error',
        code: 400,
        message: 'Source and destination accounts cannot be the same',
      });
    }

    const sourceAccount = await prisma.bankAccount.findUnique({
      where: {
        id: sourceAccountId,
      },
    });

    const destinationAccount = await prisma.bankAccount.findUnique({
      where: {
        id: destinationAccountId,
      },
    });

    if (!sourceAccount || !destinationAccount) {
      return res.status(404).json({
        status: 'error',
        code: 404,
        message: 'Source or destination account not found',
      });
    }

    if (sourceAccount.balance < amount) {
      return res.status(400).json({
        status: 'error',
        code: 400,
        message: 'Insufficient balance in source account',
      });
    }

    const updatedSourceAccount = await prisma.bankAccount.update({
      where: {
        id: sourceAccountId,
      },
      data: {
        balance: {
          decrement: amount,
        },
      },
    });

    const updatedDestinationAccount = await prisma.bankAccount.update({
      where: {
        id: destinationAccountId,
      },
      data: {
        balance: {
          increment: amount,
        },
      },
    });

    const transaction = await prisma.transaction.create({
      data: {
        source_account: {
          connect: { id: sourceAccountId },
        },
        destination_account: {
          connect: { id: destinationAccountId },
        },
        amount,
      },
    });
    return res.status(201).json({
      status: 'success',
      code: 201,
      message: 'Transaction completed successfully',
      data: transaction,
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

const getTransactions = async (req, res) => {
  try {
    const transactions = await prisma.transaction.findMany();

    return res.status(200).json({
      status: 'success',
      code: 200,
      message: 'Data ditemukan!',
      data: transactions,
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      code: 500,
      message: 'Internal server error',
    });
  }
};

const getDetailTransaction = async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    if (isNaN(id)) {
      return res.status(400).json({
        status: 'error',
        code: 400,
        message: 'Bad Request: id transaction must be a number',
      });
    }
    const detailTransaction = await prisma.transaction.findUnique({
      where: {
        id,
      },
      include: {
        source_account: {
          include: {
            user: {
              select: {
                email: true,
                name: true,
              },
            },
          },
        },
        destination_account: {
          include: {
            user: {
              select: {
                email: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!detailTransaction) {
      return res.status(200).json({
        status: 'success',
        code: 200,
        message: 'Transaction not found',
      });
    }

    return res.status(200).json({
      status: 'success',
      code: 200,
      message: 'Data ditemukan!',
      data: detailTransaction,
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      code: 500,
      message: 'Internal server error',
    });
  }
};

module.exports = {
  createTransaction,
  getTransactions,
  getDetailTransaction,
};
