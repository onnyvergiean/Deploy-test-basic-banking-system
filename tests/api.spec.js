const request = require('supertest');
const app = require('../index');

describe('GET /v1/users', () => {
  test('Return status: 200 and Users Data', async () => {
    const res = await request(app).get('/v1/users');
    expect(res.statusCode).toBe(200);

    expect(res.body).toEqual(
      expect.objectContaining({
        status: 'success',
        code: 200,
        message: 'Data ditemukan!',
        data: expect.any(Array),
      })
    );
  });
});

describe('GET /v1/users/:id', () => {
  test('Return status: 200 and user by ID', async () => {
    const userId = 1;
    const res = await request(app).get(`/v1/users/${userId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(
      expect.objectContaining({
        status: 'success',
        code: 200,
        message: 'Data ditemukan!',
        data: expect.objectContaining({
          id: expect.any(Number),
          email: expect.any(String),
          name: expect.any(String),
          password: expect.any(String),
        }),
      })
    );
  });
});
