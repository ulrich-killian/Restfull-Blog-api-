import * as postRepo from '../repositories/postRepository.js';

export const getAllPosts = async ({ limit = 10, offset = 0, search }) => {
  const posts = await postRepo.findAllPosts({ limit, offset, search });
  const total = await postRepo.countPosts(search);
  return { posts, total, limit, offset };
};

export const getPostById = async (id) => {
  const post = await postRepo.findPostById(id);
  if (!post) throw new Error('POST_NOT_FOUND');
  const comments = await postRepo.findPostComments(id);
  return { ...post, comments };
};

export const createPost = async ({ title, content, author_id }) => {
  return await postRepo.createPost({ title, content, author_id });
};

export const updatePost = async (id, userId, { title, content }) => {
  const post = await postRepo.findPostById(id);
  if (!post) throw new Error('POST_NOT_FOUND');
  if (post.author_id !== userId) throw new Error('UNAUTHORIZED');
  return await postRepo.updatePost(id, { title, content });
};

export const deletePost = async (id, userId) => {
  const post = await postRepo.findPostById(id);
  if (!post) throw new Error('POST_NOT_FOUND');
  if (post.author_id !== userId) throw new Error('UNAUTHORIZED');
  return await postRepo.deletePost(id);
};