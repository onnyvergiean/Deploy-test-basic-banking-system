const base = require('../app/controllers/api/v1/auth');
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

describe('login function', () => {
  test('it should log in successfully with valid credentials', async () => {
    const req = mockRequest({
      email: 'onny2456@gmail.com',
      password: '12345678',
    });
    const res = mockResponse();

    await base.login(req, res);

    expect(res.status).toBeCalledWith(201);
    expect(res.json).toBeCalledWith(
      expect.objectContaining({
        status: 'Success!',
        message: 'Berhasil Login!',
        data: expect.objectContaining({
          user: expect.any(Object),
          token: expect.any(String),
        }),
      })
    );
  });

  test('it should handle user not found', async () => {
    const req = mockRequest({
      email: 'nonexistent@example.com',
      password: 'password',
    });
    const res = mockResponse();

    await base.login(req, res);

    expect(res.status).toBeCalledWith(404);
    expect(res.json).toBeCalledWith(
      expect.objectContaining({
        status: 'Fail!',
        message: 'User tidak ditemukan!',
      })
    );
  });

  test('it should handle incorrect password', async () => {
    const req = mockRequest({
      email: 'onny2456@gmail.com',
      password: '999999999',
    });
    const res = mockResponse();

    await base.login(req, res);

    expect(res.status).toBeCalledWith(401);
    expect(res.json).toBeCalledWith(
      expect.objectContaining({
        status: 'Fail!',
        message: 'Password Salah!',
      })
    );
  });
});

describe('whoami function', () => {
  test('it should return user data', async () => {
    const data = {
      user: undefined,
    };

    const req = mockRequest({ user: data });
    const res = mockResponse();

    await base.whoami(req, res);

    expect(res.status).toBeCalledWith(200);
    expect(res.json).toBeCalledWith(
      expect.objectContaining({
        status: 'Success!',
        message: 'OK',
        data,
      })
    );
  });
});

describe('Register function', () => {
  test('it should register a user successfully', async () => {
    const req = mockRequest({
      email: 'newuser3@example.com',
      password: 'newpassword',
      name: 'New User',
    });
    const res = mockResponse();

    await base.register(req, res);

    expect(res.status).toBeCalledWith(201);
    expect(res.json).toBeCalledWith(
      expect.objectContaining({
        status: 'success',
        code: 200,
        message: 'Berhasil Register',
        data: expect.any(Object),
      })
    );
  });

  test('it should handle a user with the same email already registered', async () => {
    const req = mockRequest({
      email: 'existing@example.com',
      password: 'password',
      name: 'Existing User',
    });
    const res = mockResponse();

    await base.register(req, res);

    expect(res.status).toBeCalledWith(404);
    expect(res.json).toBeCalledWith(
      expect.objectContaining({
        status: 'Fail!',
        message: 'Email sudah terdaftar!',
      })
    );
  });
});
