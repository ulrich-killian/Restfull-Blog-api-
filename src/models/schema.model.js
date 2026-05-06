import { pool } from '../config/database.config.js';
import bcrypt from 'bcryptjs';

export const createTables = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        profile_picture VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        author_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        content TEXT NOT NULL,
        post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
        author_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Tables created successfully');
    await seedData();
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  }
};

const seedData = async () => {
  try {
    const existing = await pool.query(`SELECT id FROM users WHERE email = 'alice@blog.com'`);
    if (existing.rows.length > 0) {
      console.log('Seed data already exists, skipping');
      return;
    }


    const hash1 = await bcrypt.hash('password123', 10);
    const hash2 = await bcrypt.hash('password456', 10);
    const hash3 = await bcrypt.hash('password789', 10);

    const u1 = await pool.query(`INSERT INTO users (username, email, password_hash) VALUES ('alice', 'alice@blog.com', $1) RETURNING id`, [hash1]);
    const u2 = await pool.query(`INSERT INTO users (username, email, password_hash) VALUES ('bob', 'bob@blog.com', $1) RETURNING id`, [hash2]);
    const u3 = await pool.query(`INSERT INTO users (username, email, password_hash) VALUES ('charlie', 'charlie@blog.com', $1) RETURNING id`, [hash3]);

    const id1 = u1.rows[0].id;
    const id2 = u2.rows[0].id;
    const id3 = u3.rows[0].id;


    const posts = await pool.query(`
      INSERT INTO posts (title, content, author_id) VALUES
      ('Getting Started with Node.js', 'Node.js is a JavaScript runtime built on Chrome V8 engine...', $1),
      ('PostgreSQL Best Practices', 'PostgreSQL is a powerful open-source relational database...', $2),
      ('Building RESTful APIs', 'REST stands for Representational State Transfer...', $3),
      ('JWT Authentication Guide', 'JSON Web Tokens are a compact way to securely transmit info...', $1),
      ('Express Middleware Explained', 'Middleware functions are functions that have access to req and res...', $2)
      RETURNING id
    `, [id1, id2, id3]);

    const pids = posts.rows.map(r => r.id);


    await pool.query(`
      INSERT INTO comments (content, post_id, author_id) VALUES
      ('Great introduction to Node.js!', $1, $4),
      ('Very helpful, thanks for sharing.', $1, $5),
      ('PostgreSQL is my favourite database.', $2, $4),
      ('Could you cover indexes in more detail?', $2, $6),
      ('REST APIs are so important to learn.', $3, $5),
      ('Excellent breakdown of REST principles.', $3, $4),
      ('JWT tokens saved my project!', $4, $6),
      ('How do you handle token refresh?', $4, $5),
      ('Middleware is confusing at first but this helps.', $5, $6),
      ('Would love a follow-up on error handling middleware.', $5, $4)
    `, [pids[0], pids[1], pids[2], id2, id3, id1]);

    console.log('Seed data inserted successfully — 3 users, 5 posts, 10 comments');
  } catch (error) {
    console.error('Error seeding data:', error);
  }
};