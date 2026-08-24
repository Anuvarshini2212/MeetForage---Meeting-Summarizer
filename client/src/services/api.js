import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5 * 60 * 1000, // 5 minutes — transcription + summarization can take a while
});

// Attach the stored auth token to every request, if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If the token is invalid/expired, clear it and send the user back to login
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

function extractErrorMessage(error) {
  if (error.response?.data?.message) return error.response.data.message;
  if (error.code === 'ECONNABORTED') return 'The request took too long. Please try again.';
  if (!error.response) return 'Cannot reach the server. Check your connection and try again.';
  return 'Something went wrong. Please try again.';
}

export async function uploadMeeting(file, onProgress) {
  const formData = new FormData();
  formData.append('audio', file);

  try {
    const res = await api.post('/meetings', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (evt) => {
        if (onProgress && evt.total) {
          onProgress(Math.round((evt.loaded * 100) / evt.total));
        }
      },
    });
    return res.data.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
}

export async function fetchMeetings() {
  try {
    const res = await api.get('/meetings');
    return res.data.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
}

export async function fetchMeetingById(id) {
  try {
    const res = await api.get(`/meetings/${id}`);
    return res.data.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
}

export async function signupUser({ name, email, password }) {
  try {
    const res = await api.post('/auth/signup', { name, email, password });
    return res.data.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
}

export async function loginUser({ email, password }) {
  try {
    const res = await api.post('/auth/login', { email, password });
    return res.data.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
}

export async function fetchCurrentUser() {
  try {
    const res = await api.get('/auth/me');
    return res.data.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
}

export async function deleteMeetingById(id) {
  try {
    const res = await api.delete(`/meetings/${id}`);
    return res.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
}
