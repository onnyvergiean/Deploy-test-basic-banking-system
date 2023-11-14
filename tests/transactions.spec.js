const base = require('../app/controllers/api/v1/transactions');
const {
  PrismaClient,
  PrismaClientKnownRequestError,
} = require('@prisma/client');
const prisma = new PrismaClient();

const mockRequest = (body = {}, query = {}, params = {}) => ({
  body,
  query,
  params,
});
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('transactions.createTransaction function', () => {
  test('it should create a transaction successfully', async () => {
    const req = mockRequest({
      sourceAccountId: 4,
      destinationAccountId: 5,
      amount: 10,
    });
    const res = mockResponse();

    await base.createTransaction(req, res);

    expect(res.status).toBeCalledWith(201);
    expect(res.json).toBeCalledWith(
      expect.objectContaining({
        status: 'success',
        code: 201,
        message: 'Transaction completed successfully',
        data: expect.any(Object),
      })
    );
  });

  test('it should handle bad request for invalid input', async () => {
    const req = mockRequest({
      sourceAccountId: 'invalid',
      destinationAccountId: 'invalid',
      amount: 'invalid',
    });
    const res = mockResponse();

    await base.createTransaction(req, res);

    expect(res.status).toBeCalledWith(400);
    expect(res.json).toBeCalledWith(
      expect.objectContaining({
        status: 'error',
        code: 400,
        message:
          'Bad Request: sourceAccountId, destinationAccountId, and amount must be numbers',
      })
    );
  });

  test('it should handle source and destination accounts being the same', async () => {
    const req = mockRequest({
      sourceAccountId: 4,
      destinationAccountId: 4,
      amount: 100.0,
    });
    const res = mockResponse();

    await base.createTransaction(req, res);

    expect(res.status).toBeCalledWith(400);
    expect(res.json).toBeCalledWith(
      expect.objectContaining({
        status: 'error',
        code: 400,
        message: 'Source and destination accounts cannot be the same',
      })
    );
  });

  test('it should handle source account not found', async () => {
    const req = mockRequest({
      sourceAccountId: 999,
      destinationAccountId: 4,
      amount: 100.0,
    });
    const res = mockResponse();

    await base.createTransaction(req, res);

    expect(res.status).toBeCalledWith(404);
    expect(res.json).toBeCalledWith(
      expect.objectContaining({
        status: 'error',
        code: 404,
        message: 'Source or destination account not found',
      })
    );
  });
  test('it should handle insufficient balance in source account', async () => {
    const req = mockRequest({
      sourceAccountId: 5,
      destinationAccountId: 4,
      amount: 100000000,
    });
    const res = mockResponse();

    await base.createTransaction(req, res);

    expect(res.status).toBeCalledWith(400);
    expect(res.json).toBeCalledWith(
      expect.objectContaining({
        status: 'error',
        code: 400,
        message: 'Insufficient balance in source account',
      })
    );
  });
});

describe('transactions.getTransactions function', () => {
  test('it should return a list of transactions successfully', async () => {
    const req = mockRequest();
    const res = mockResponse();

    await base.getTransactions(req, res);

    expect(res.status).toBeCalledWith(200);
    expect(res.json).toBeCalledWith(
      expect.objectContaining({
        status: 'success',
        code: 200,
        message: 'Data ditemukan!',
        data: expect.any(Array),
      })
    );
  });
});

describe('transactions.getDetailTransaction function', () => {
  test('it should retrieve a transaction by ID successfully', async () => {
    const req = {
      params: {
        id: 1,
      },
    };
    const res = mockResponse();

    await base.getDetailTransaction(req, res);

    expect(res.status).toBeCalledWith(200);
    expect(res.json).toBeCalledWith(
      expect.objectContaining({
        status: 'success',
        code: 200,
        message: 'Data ditemukan!',
        data: expect.any(Object),
      })
    );
  });
  test('it should handle transaction not found', async () => {
    const req = {
      params: {
        id: 999,
      },
    };
    const res = mockResponse();

    await base.getDetailTransaction(req, res);

    expect(res.status).toBeCalledWith(200);
    expect(res.json).toBeCalledWith(
      expect.objectContaining({
        status: 'success',
        code: 200,
        message: 'Transaction not found',
      })
    );
  });
  test('it should handle invalid ID', async () => {
    const req = {
      params: {
        id: 'invalid',
      },
    };
    const res = mockResponse();

    await base.getDetailTransaction(req, res);

    expect(res.status).toBeCalledWith(400);
    expect(res.json).toBeCalledWith(
      expect.objectContaining({
        status: 'error',
        code: 400,
        message: 'Bad Request: id transaction must be a number',
      })
    );
  });
});
