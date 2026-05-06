import * as commentRepo from '../repositories/commentRepository.js';
import { findPostById } from '../repositories/postRepository.js';

export const getCommentsByPostId = async (postId) => {
  const post = await findPostById(postId);
  if (!post) throw new Error('POST_NOT_FOUND');
  return await commentRepo.findCommentsByPostId(postId);
};

export const createComment = async ({ content, post_id, author_id }) => {
  const post = await findPostById(post_id);
  if (!post) throw new Error('POST_NOT_FOUND');
  return await commentRepo.createComment({ content, post_id, author_id });
};

export const deleteComment = async (id, userId) => {
  const comment = await commentRepo.findCommentById(id);
  if (!comment) throw new Error('COMMENT_NOT_FOUND');
  if (comment.author_id !== userId) throw new Error('UNAUTHORIZED');
  return await commentRepo.deleteComment(id);
};