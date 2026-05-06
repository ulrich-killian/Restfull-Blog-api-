import { pool } from '../config/database.config.js';

export const findAllPosts = async ({ limit, offset, search }) => {
  let query = `
    SELECT p.*, u.username as author_username,
    COUNT(c.id) as comment_count
    FROM posts p
    LEFT JOIN users u ON p.author_id = u.id
    LEFT JOIN comments c ON c.post_id = p.id
  `;
  const params = [];
  let paramIndex = 1;

  if (search) {
    query += ` WHERE p.title ILIKE $${paramIndex} OR p.content ILIKE $${paramIndex}`;
    params.push(`%${search}%`);
    paramIndex++;
  }

  query += ` GROUP BY p.id, u.username ORDER BY p.created_at DESC`;
  query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  params.push(limit, offset);

  const result = await pool.query(query, params);
  return result.rows;
};

export const countPosts = async (search) => {
  let query = `SELECT COUNT(*) FROM posts p`;
  const params = [];

  if (search) {
    query += ` WHERE p.title ILIKE $1 OR p.content ILIKE $1`;
    params.push(`%${search}%`);
  }

  const result = await pool.query(query, params);
  return parseInt(result.rows[0].count);
};

export const findPostById = async (id) => {
  const result = await pool.query(`
    SELECT p.*, u.username as author_username
    FROM posts p
    LEFT JOIN users u ON p.author_id = u.id
    WHERE p.id = $1
  `, [id]);
  return result.rows[0];
};

export const findPostComments = async (postId) => {
  const result = await pool.query(`
    SELECT c.*, u.username as author_username
    FROM comments c
    LEFT JOIN users u ON c.author_id = u.id
    WHERE c.post_id = $1
    ORDER BY c.created_at ASC
  `, [postId]);
  return result.rows;
};

export const createPost = async ({ title, content, author_id }) => {
  const result = await pool.query(
    `INSERT INTO posts (title, content, author_id) VALUES ($1, $2, $3) RETURNING *`,
    [title, content, author_id]
  );
  return result.rows[0];
};

export const updatePost = async (id, { title, content }) => {
  const result = await pool.query(
    `UPDATE posts SET
      title = COALESCE($1, title),
      content = COALESCE($2, content),
      updated_at = CURRENT_TIMESTAMP
     WHERE id = $3 RETURNING *`,
    [title, content, id]
  );
  return result.rows[0];
};

export const deletePost = async (id) => {
  const result = await pool.query(
    `DELETE FROM posts WHERE id = $1 RETURNING id`,
    [id]
  );
  return result.rows[0];
};