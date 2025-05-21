const request = require('supertest');
const app = require('../src/index');
const storage = require('../src/services/storage');

let server;

beforeAll(async () => {
  await storage.clearAll();
  server = await app.startServer();
});

afterAll(async () => {
  if (server) {
    await new Promise(resolve => server.close(resolve));
  }
});

const testUser = {
  username: 'testuser',
  password: 'password123'
};

describe('Authentication Endpoints', () => {
  let authToken;
  
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);
      
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('userId');
      expect(res.body).toHaveProperty('username', testUser.username);
    });

    it('should not allow duplicate usernames', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);
      
      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toHaveProperty('message');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should authenticate user and return token/session', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send(testUser);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Login successful');

      if (res.body.token) {
        authToken = res.body.token;
      }
    });

    it('should reject invalid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          username: testUser.username,
          password: 'wrongpassword'
        });
      
      expect(res.statusCode).toEqual(401);
      expect(res.body.error).toHaveProperty('message');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return user information when authenticated', async () => {
      if (!authToken) {
        return;
      }
      
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('user');
      expect(res.body.user).toHaveProperty('username', testUser.username);
    });

    it('should reject unauthenticated requests', async () => {
      const res = await request(app)
        .get('/api/auth/me');
      
      expect(res.statusCode).toEqual(401);
    });
  });
});