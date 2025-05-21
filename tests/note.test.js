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
  username: 'noteuser',
  password: 'password123'
};

const testNote = {
  title: 'Test Note',
  content: 'This is a test note content.'
};

describe('Note Endpoints', () => {
  let authToken;
  let noteId;

  beforeAll(async () => {
    await request(app)
      .post('/api/auth/register')
      .send(testUser);

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send(testUser);
    
    if (loginRes.body.token) {
      authToken = loginRes.body.token;
    }
  });
  
  describe('POST /api/notes', () => {
    it('should create a new note', async () => {
      const agent = request(app);
      const req = agent.post('/api/notes').send(testNote);

      if (authToken) {
        req.set('Authorization', `Bearer ${authToken}`);
      }
      
      const res = await req;
      
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('title', testNote.title);
      expect(res.body).toHaveProperty('content', testNote.content);
      noteId = res.body.id;
    });
    
    it('should require authentication', async () => {
      const res = await request(app)
        .post('/api/notes')
        .send(testNote);
      
      expect(res.statusCode).toEqual(401);
    });
  });
  
  describe('GET /api/notes', () => {
    it('should get all notes for authenticated user', async () => {
      const agent = request(app);
      const req = agent.get('/api/notes');
      if (authToken) {
        req.set('Authorization', `Bearer ${authToken}`);
      }
      
      const res = await req;
      
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });
  
  describe('GET /api/notes/:id', () => {
    it('should get a specific note by ID', async () => {
      const agent = request(app);
      const req = agent.get(`/api/notes/${noteId}`);

      if (authToken) {
        req.set('Authorization', `Bearer ${authToken}`);
      }
      
      const res = await req;
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('id', noteId);
      expect(res.body).toHaveProperty('title', testNote.title);
    });
    
    it('should not allow access to notes from other users', async () => {
      // Create another user
      const otherUser = {
        username: 'otheruser',
        password: 'password123'
      };

      // Register and login the other user
      await request(app)
        .post('/api/auth/register')
        .send(otherUser);

      const otherLoginRes = await request(app)
        .post('/api/auth/login')
        .send(otherUser);

      const otherAuthToken = otherLoginRes.body.token;

      // Try to access the note with other user's token
      const agent = request(app);
      const req = agent.get(`/api/notes/${noteId}`);
      
      if (otherAuthToken) {
        req.set('Authorization', `Bearer ${otherAuthToken}`);
      }
      
      const res = await req;
      
      expect(res.statusCode).toEqual(403);
      expect(res.body.error).toHaveProperty('message');
    });
  });
  
  describe('PUT /api/notes/:id', () => {
    it('should update a specific note', async () => {
      const updatedNote = {
        title: 'Updated Test Note',
        content: 'This note has been updated.'
      };
      
      const agent = request(app);
      const req = agent.put(`/api/notes/${noteId}`).send(updatedNote);

      if (authToken) {
        req.set('Authorization', `Bearer ${authToken}`);
      }
      
      const res = await req;
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('id', noteId);
      expect(res.body).toHaveProperty('title', updatedNote.title);
      expect(res.body).toHaveProperty('content', updatedNote.content);
    });
  });
  
  describe('DELETE /api/notes/:id', () => {
    it('should delete a specific note', async () => {
      const agent = request(app);
      const req = agent.delete(`/api/notes/${noteId}`);
      if (authToken) {
        req.set('Authorization', `Bearer ${authToken}`);
      }
      
      const res = await req;
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Note deleted successfully');

      const getReq = agent.get(`/api/notes/${noteId}`);
      if (authToken) {
        getReq.set('Authorization', `Bearer ${authToken}`);
      }
      
      const getRes = await getReq;
      expect(getRes.statusCode).toEqual(404);
    });
  });
});