const base = require('../app/controllers/api/v1/users');
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

describe('users.getUsers function', () => {
  test('it should return users data successfully', async () => {
    const req = mockRequest();
    const res = mockResponse();

    await base.getUsers(req, res);

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
  test('it should return users data for a specific search query', async () => {
    const req = mockRequest({
      search: 'onny',
    });
    const res = mockResponse();

    await base.getUsers(req, res);

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
  test('it should return users data for a specific page and limit', async () => {
    const req = mockRequest(
      {},
      {
        page: 1,
        limit: 10,
      }
    );
    const res = mockResponse();

    await base.getUsers(req, res);

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
  test('it should handle no result for users data', async () => {
    const req = mockRequest(
      {},
      {
        page: 3,
      }
    );
    const res = mockResponse();
    await base.getUsers(req, res);
    expect(res.status).toBeCalledWith(200);
    expect(res.json).toBeCalledWith(
      expect.objectContaining({
        status: 'success',
        code: 200,
        message: 'Data not found',
      })
    );
  });
});

describe('users.updateUser function', () => {
  beforeAll(async () => {
    await prisma.user.create({
      data: {
        name: 'Test User',
        email: 'testupdate@example.com',
        password: 'testpassword',
      },
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: {
        email: 'testupdate@example.com',
      },
    });
    await prisma.$disconnect();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('it should update a user successfully', async () => {
    const req = {
      params: {
        id: 18,
      },
      body: {
        name: 'Updated Name',
        email: 'updated@example.com',
        password: 'newpassword',
      },
    };

    const res = mockResponse();

    await base.updateUser(req, res);

    expect(res.status).toBeCalledWith(200);
    expect(res.json).toBeCalledWith({
      status: 'success',
      code: 200,
      message: 'User updated successfully',
      data: expect.any(Object),
    });
  });

  it('it should handle a non-numeric ID', async () => {
    const req = {
      params: {
        id: 'invalid_id',
      },
      body: {
        name: 'Updated Name',
        email: 'updated@example.com',
        password: 'newpassword',
      },
    };

    const res = mockResponse();

    await base.updateUser(req, res);

    expect(res.status).toBeCalledWith(400);
    expect(res.json).toBeCalledWith({
      status: 'error',
      code: 400,
      message: 'Bad Request : ID must be a number',
    });
  });

  it('it should handle a user not found', async () => {
    const req = {
      params: {
        id: 999,
      },
      body: {
        name: 'Updated Name',
        email: 'updated@example.com',
        password: 'newpassword',
      },
    };

    const res = mockResponse();

    await base.updateUser(req, res);

    expect(res.status).toBeCalledWith(404);
    expect(res.json).toBeCalledWith({
      status: 'error',
      code: 404,
      message: 'User not found',
    });
  });
});

describe('users.deleteUser function', () => {
  beforeAll(async () => {
    await prisma.user.create({
      data: {
        name: 'Test User',
        email: 'test@example.com',
        password: 'testpassword',
      },
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: {
        email: 'test@example.com',
      },
    });
    await prisma.$disconnect();
  });

  it('it should delete a user successfully', async () => {
    const req = {
      params: {
        id: 337,
      },
    };
    const res = mockResponse();

    await base.deleteUser(req, res);

    expect(res.status).toBeCalledWith(200);
    expect(res.json).toBeCalledWith({
      status: 'success',
      code: 200,
      message: 'User deleted successfully',
      data: expect.any(Object),
    });
  });
  it('it should handle a non-numeric ID for deletion', async () => {
    const req = {
      params: {
        id: 'invalid_id',
      },
    };

    const res = mockResponse();

    await base.deleteUser(req, res);

    expect(res.status).toBeCalledWith(400);
    expect(res.json).toBeCalledWith({
      status: 'error',
      code: 400,
      message: 'Bad Request : ID must be a number',
    });
  });

  it('it should handle a user not found during deletion', async () => {
    const req = {
      params: {
        id: 999,
      },
    };

    const res = mockResponse();
    await base.deleteUser(req, res);

    expect(res.status).toBeCalledWith(404);
    expect(res.json).toBeCalledWith({
      status: 'error',
      code: 404,
      message: 'User not found',
    });
  });
  it('it should handle Internal server error', async () => {
    const mockDelete = jest.spyOn(prisma.user, 'delete');
    mockDelete.mockRejectedValueOnce(new Error('Internal server error'));

    const req = {
      params: {
        id: 1,
      },
    };

    const res = mockResponse();
    await base.deleteUser(req, res);

    expect(res.status).toBeCalledWith(500);
    expect(res.json).toBeCalledWith({
      status: 'error',
      code: 500,
      message: 'Internal server error',
    });
  });
});

describe('users.getUserById function', () => {
  beforeAll(async () => {
    await prisma.user.create({
      data: {
        name: 'Test User',
        password: 'testpasswordbyid',
        email: 'testgetbyid@example.com',
      },
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: {
        email: 'testgetbyid@example.com',
      },
    });
    await prisma.$disconnect();
  });

  it('it should get a user by ID successfully', async () => {
    const req = {
      params: {
        id: 1,
      },
    };

    const res = mockResponse();

    await base.getUserById(req, res);

    expect(res.status).toBeCalledWith(200);
    expect(res.json).toBeCalledWith({
      status: 'success',
      code: 200,
      message: 'Data ditemukan!',
      data: expect.any(Object),
    });
  });

  it('it should handle a non-numeric ID', async () => {
    const req = {
      params: {
        id: 'invalid_id',
      },
    };

    const res = mockResponse();

    await base.getUserById(req, res);

    expect(res.status).toBeCalledWith(400);
    expect(res.json).toBeCalledWith({
      status: 'error',
      code: 400,
      message: 'Bad Request : ID must be a number',
    });
  });

  it('it should handle user not found', async () => {
    const req = {
      params: {
        id: 999,
      },
    };

    const res = mockResponse();
    await base.getUserById(req, res);

    expect(res.status).toBeCalledWith(200);
    expect(res.json).toBeCalledWith({
      status: 'success',
      code: 200,
      message: 'User not found',
    });
  });
});
