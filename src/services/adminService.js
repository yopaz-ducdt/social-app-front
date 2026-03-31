import api from './api';

export const adminService = {
  // ── Users ─────────────────────────────────────────────────
  // GET /admin/users?name=&page=&size=
  getUsers: (name = '', page = 0, size = 10) =>
    api.get('/admin/users', { params: { name, page, size } }),

  // POST /admin/users/:id/enabled  (toggle enable/disable)
  toggleUser: (id) => api.post(`/admin/users/${id}/enabled`),

  // GET /admin/users/:id/reports?page=&size=
  getUserReports: (id, page = 0, size = 10) =>
    api.get(`/admin/users/${id}/reports`, { params: { page, size } }),

  // ── Posts ─────────────────────────────────────────────────
  // GET /admin/posts?title=&page=&size=
  getPosts: (title = '', page = 0, size = 10) =>
    api.get('/admin/posts', { params: { title, page, size } }),

  // GET /admin/warning-posts?page=&size=
  getWarningPosts: (page = 0, size = 10) =>
    api.get('/admin/warning-posts', { params: { page, size } }),

  // GET /admin/posts/:id
  getPost: (id) => api.get(`/admin/posts/${id}`),

  // DELETE /admin/posts/:id
  deletePost: (id) => api.delete(`/admin/posts/${id}`),

  // GET /admin/posts/:id/reports?page=&size=
  getPostReports: (id, page = 0, size = 10) =>
    api.get(`/admin/posts/${id}/reports`, { params: { page, size } }),

  // ── Reports ───────────────────────────────────────────────
  // GET /admin/reports?page=&size=
  getAllReports: (page = 0, size = 10) => api.get('/admin/reports', { params: { page, size } }),

  // GET /admin/reports/:id
  getReport: (id) => api.get(`/admin/reports/${id}`),

  // DELETE /admin/reports/:id
  deleteReport: (id) => api.delete(`/admin/reports/${id}`),
};
