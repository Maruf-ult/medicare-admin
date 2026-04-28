import axios from 'axios'

const api = axios.create({
     baseURL:process.env.NEXT_PUBLIC_API_URL,
     headers:{
          'Content-Type': 'application/json',
     },
});

// ── Request interceptor — attach JWT token ─────────────────

api.interceptors.request.use((config)=>{
     if(typeof window !== 'undefined'){
         const token = localStorage.getItem('medicare_admin_token');
         if(token){
           config.headers.Authorization = `Bearer ${token}`;
         }
     }
     return config;
});

// ── Response interceptor — handle 401 ─────────────────────
api.interceptors.response.use(
     (response) => response,
 (error)=>{
     if(error.response?.status === 401){
     if(typeof window !== 'undefined'){
          localStorage.removeItem('medicare_admin_token');
          localStorage.removeItem('medicare_admin_user');
          window.location.href = '/login';
     }
  }
  return Promise.reject(error);
 }
);

export default api;
