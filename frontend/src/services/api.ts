import axios from 'axios';
import { env } from '@/lib/env';

const api = axios.create({
  baseURL: env.VITE_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
