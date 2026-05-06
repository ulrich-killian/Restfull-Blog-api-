import request from 'supertest';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import authRoutes from '../src/routes/authRoutes.js';
import postRoutes from '../src/routes/postRoutes.js';
import commentRoutes from '../src/routes/commentRoutes.js';

dotenv.config();

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use('/auth', authRoutes);
app.use('/posts', postRoutes);
app.use('/posts/:id/comments', commentRoutes);

// shared state across tests
let token;
let postId;
let commentId;
const testEmail = `test_${Date.now()}@blog.com`;
const testUsername = `user${Date.now()}`;

// ─── AUTH TESTS ───────────────────────────────────────────
describe('Auth Endpoints', () => {

  test('POST /auth/register — should register a new user', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({
        username: testUsername,
        email: testEmail,
        password: 'testpass123'
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    token = res.body.token;
  });

  test('POST /auth/register — should fail with duplicate email', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({
        username: testUsername,
        email: testEmail,
        password: 'testpass123'
      });
    expect(res.statusCode).toBe(409);
  });

  test('POST /auth/register — should fail with invalid email', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({
        username: 'newuser123',
        email: 'not-an-email',
        password: 'testpass123'
      });
    expect(res.statusCode).toBe(400);
  });

  test('POST /auth/login — should login successfully', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: testEmail, password: 'testpass123' });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    token = res.body.token;
  });

  test('POST /auth/login — should fail with wrong password', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: testEmail, password: 'wrongpassword' });
    expect(res.statusCode).toBe(401);
  });

  test('GET /auth/me — should return logged in user', async () => {
    const res = await request(app)
      .get('/auth/me')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.email).toBe(testEmail);
  });

  test('GET /auth/me — should fail without token', async () => {
    const res = await request(app).get('/auth/me');
    expect(res.statusCode).toBe(401);
  });
});

// ─── POST TESTS ───────────────────────────────────────────
describe('Post Endpoints', () => {

  test('GET /posts — should return list of posts', async () => {
    const res = await request(app).get('/posts');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.posts)).toBe(true);
  });

  test('GET /posts — should support pagination', async () => {
    const res = await request(app).get('/posts?limit=2&offset=0');
    expect(res.statusCode).toBe(200);
    expect(res.body.posts.length).toBeLessThanOrEqual(2);
  });

  test('GET /search?q=Node — should return matching posts', async () => {
    const res = await request(app).get('/posts?q=Node');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('POST /posts — should create a new post', async () => {
    const res = await request(app)
      .post('/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Test Post from Jest',
        content: 'This is test content written by the test suite.'
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.data.title).toBe('Test Post from Jest');
    postId = res.body.data.id;
  });

  test('POST /posts — should fail without auth', async () => {
    const res = await request(app)
      .post('/posts')
      .send({ title: 'Unauthorized Post', content: 'Should not be created.' });
    expect(res.statusCode).toBe(401);
  });

  test('POST /posts — should fail with missing title', async () => {
    const res = await request(app)
      .post('/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'No title here' });
    expect(res.statusCode).toBe(400);
  });

  test('GET /posts/:id — should return a single post with comments', async () => {
    const res = await request(app).get(`/posts/${postId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.id).toBe(postId);
    expect(Array.isArray(res.body.data.comments)).toBe(true);
  });

  test('GET /posts/:id — should return 404 for non-existent post', async () => {
    const res = await request(app).get('/posts/999999');
    expect(res.statusCode).toBe(404);
  });

  test('PUT /posts/:id — should update a post', async () => {
    const res = await request(app)
      .put(`/posts/${postId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Updated Test Post' });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.title).toBe('Updated Test Post');
  });
});

// ─── COMMENT TESTS ────────────────────────────────────────
describe('Comment Endpoints', () => {

  test('POST /posts/:id/comments — should add a comment', async () => {
    const res = await request(app)
      .post(`/posts/${postId}/comments`)
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'This is a test comment from Jest.' });
    expect(res.statusCode).toBe(201);
    expect(res.body.data.content).toBe('This is a test comment from Jest.');
    commentId = res.body.data.id;
  });

  test('POST /posts/:id/comments — should fail without auth', async () => {
    const res = await request(app)
      .post(`/posts/${postId}/comments`)
      .send({ content: 'Unauthorized comment' });
    expect(res.statusCode).toBe(401);
  });

  test('POST /posts/:id/comments — should fail with empty content', async () => {
    const res = await request(app)
      .post(`/posts/${postId}/comments`)
      .set('Authorization', `Bearer ${token}`)
      .send({ content: '' });
    expect(res.statusCode).toBe(400);
  });

  test('GET /posts/:id/comments — should list comments for a post', async () => {
    const res = await request(app).get(`/posts/${postId}/comments`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('DELETE /posts/:id/comments/:commentId — should delete a comment', async () => {
    const res = await request(app)
      .delete(`/posts/${postId}/comments/${commentId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('DELETE /posts/:id — should delete the post', async () => {
    const res = await request(app)
      .delete(`/posts/${postId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
import { pool } from '../src/config/database.config.js';

afterAll(async () => {
  await pool.end();
});