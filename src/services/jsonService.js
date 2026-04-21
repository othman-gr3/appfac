import axios from "axios";

const BASE_URL = "http://localhost:3001";

const api = axios.create({
  baseURL: BASE_URL,
});

// ─── ARTICLES ────────────────────────────────────────────────

// Get all articles
export const getArticles = async () => {
  const res = await api.get("/articles");
  return res.data;
};

// Get one article by ID
export const getArticle = async (id) => {
  const res = await api.get(`/articles/${id}`);
  return res.data;
};

// Get articles by category
export const getArticlesByCategorie = async (categorieId) => {
  const res = await api.get(`/articles?categorie_id=${categorieId}`);
  return res.data;
};

// Create a new article
export const createArticle = async (articleData) => {
  const res = await api.post("/articles", articleData);
  return res.data;
};

// Update an article
export const updateArticle = async (id, articleData) => {
  const res = await api.put(`/articles/${id}`, articleData);
  return res.data;
};

// Delete an article
export const deleteArticle = async (id) => {
  await api.delete(`/articles/${id}`);
};

// ─── CATEGORIES ──────────────────────────────────────────────

// Get all categories
export const getCategories = async () => {
  const res = await api.get("/categories");
  return res.data;
};

// Get one category by ID
export const getCategorie = async (id) => {
  const res = await api.get(`/categories/${id}`);
  return res.data;
};

// Create a new category
export const createCategorie = async (categorieData) => {
  const res = await api.post("/categories", categorieData);
  return res.data;
};

// Update a category
export const updateCategorie = async (id, categorieData) => {
  const res = await api.put(`/categories/${id}`, categorieData);
  return res.data;
};

// Delete a category
export const deleteCategorie = async (id) => {
  await api.delete(`/categories/${id}`);
};
