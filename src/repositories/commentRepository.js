import { pool } from '../config/database.config.js';

export const findCommentsByPostId = async (postId) => {
  const result = await pool.query(`
    SELECT c.*, u.username as author_username
    FROM comments c
    LEFT JOIN users u ON c.author_id = u.id
    WHERE c.post_id = $1
    ORDER BY c.created_at ASC
  `, [postId]);
  return result.rows;
};

export const findCommentById = async (id) => {
  const result = await pool.query(`
    SELECT c.*, u.username as author_username
    FROM comments c
    LEFT JOIN users u ON c.author_id = u.id
    WHERE c.id = $1
  `, [id]);
  return result.rows[0];
};

export const createComment = async ({ content, post_id, author_id }) => {
  const result = await pool.query(
    `INSERT INTO comments (content, post_id, author_id) VALUES ($1, $2, $3) RETURNING *`,
    [content, post_id, author_id]
  );
  return result.rows[0];
};

export const deleteComment = async (id) => {
  const result = await pool.query(
    `DELETE FROM comments WHERE id = $1 RETURNING id`,
    [id]
  );
  return result.rows[0];
};