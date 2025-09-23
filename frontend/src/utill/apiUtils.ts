import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// Configure axios defaults
axios.defaults.headers.post['Content-Type'] = 'application/json';

const token  = localStorage.getItem('token');
if (token) {
  axios.defaults.headers.common['x-auth-token'] = token;
}