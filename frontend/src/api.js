import axios from "axios";

// --- token structure was removed because TS types aren't needed ---

const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";
//const API_BASE = "http://127.0.0.1:8000/api";

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
  // set withCredentials if your backend uses cookies for auth
  withCredentials: false,
});

// --- token helpers (stores tokens in localStorage) ---
const ACCESS_KEY = "ea_access_token";
const REFRESH_KEY = "ea_refresh_token";

export function setAccessToken(token) {
  if (token) {
    localStorage.setItem(ACCESS_KEY, token);
  } else {
    localStorage.removeItem(ACCESS_KEY);
  }
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS_KEY);
}

export function setRefreshToken(token) {
  if (token) {
    localStorage.setItem(REFRESH_KEY, token);
  } else {
    localStorage.removeItem(REFRESH_KEY);
  }
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_KEY);
}

export function clearAuthTokens() {
  setAccessToken(null);
  setRefreshToken(null);
}

// attach token from storage on every request
api.interceptors.request.use((cfg) => {
  const token = getAccessToken();
  if (token && cfg.headers) {
    cfg.headers.Authorization = `Bearer ${token}`;
  }
  return cfg;
});

// --- refresh token logic to retry requests on 401 ---
let isRefreshing = false;
let failedQueue = [];

async function processQueue(error) {
  failedQueue.forEach((p) => {
    if (error) p.reject(error);
    else p.resolve(p.config);
  });
  failedQueue = [];
}

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;

    // If no response or not 401, just reject
    if (!err.response || err.response.status !== 401) {
      return Promise.reject(err);
    }

    // Avoid infinite loop
    if (originalRequest._retry) {
      return Promise.reject(err);
    }
    originalRequest._retry = true;

    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      clearAuthTokens();
      return Promise.reject(err);
    }

    if (isRefreshing) {
      // queue the request and return a promise that'll be resolved when token refreshed
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject, config: originalRequest });
      })
        .then((cfg) => api.request(cfg))
        .catch((e) => Promise.reject(e));
    }

    isRefreshing = true;

    try {
      // Attempt token refresh
      const resp = await axios.post(
        `${API_BASE.replace(/\/+$/, "")}/token/refresh/`,
        { refresh: refreshToken },
        { headers: { "Content-Type": "application/json" } }
      );

      const newAccess = resp.data.access;
      const newRefresh = resp.data.refresh ?? refreshToken;

      setAccessToken(newAccess);
      setRefreshToken(newRefresh);

      processQueue(null);
      isRefreshing = false;

      // retry original request with new token
      return api.request(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError);
      isRefreshing = false;
      clearAuthTokens();
      return Promise.reject(refreshError);
    }
  }
);

// --- convenience auth helpers ---
export async function loginWithCredentials(username, password) {
  const resp = await api.post("/token/", { username, password });
  const { access, refresh } = resp.data;
  setAccessToken(access);
  if (refresh) setRefreshToken(refresh);
  return { access, refresh };
}

export async function logout() {
  clearAuthTokens();
}

// --- useful wrapper for JSON responses ---
export async function get(url, cfg) {
  const r = await api.get(url, cfg);
  return r.data;
}

export async function post(url, data, cfg) {
  const r = await api.post(url, data, cfg);
  return r.data;
}

export async function patch(url, data, cfg) {
  const r = await api.patch(url, data, cfg);
  return r.data;
}

export async function put(url, data, cfg) {
  const r = await api.put(url, data, cfg);
  return r.data;
}

export async function del(url, cfg) {
  const r = await api.delete(url, cfg);
  return r.data;
}

export default api;
