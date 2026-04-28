import { AuthResponse } from "@/types";

const TOKEN_KEY = 'medicare_admin_token';
const USER_KEY = 'medicare_admin_user';

export const authUtils = {
     setAuth: (data:AuthResponse) => {
          localStorage.setItem(TOKEN_KEY,data.token);
          localStorage.setItem(USER_KEY,JSON.stringify(data));
     },
     getToken: (): string|null => {
          if(typeof window !== 'undefined'){
               return null;
          }
          return localStorage.getItem(TOKEN_KEY);

     },

     getUser: (): AuthResponse | null => {
          if(typeof window !== 'undefined'){
               return null;
          }
          const user =  localStorage.getItem(USER_KEY);
          return user? JSON.parse(user): null;
         
     },

     isAuthenticated: (): boolean =>{
          if(typeof window !== 'undefined'){
               return false;
          }
          const token = localStorage.getItem(TOKEN_KEY);
          const user = localStorage.getItem(USER_KEY);
          if(!token || !user) return false;

          //Check token expiry
          const userData: AuthResponse = JSON.parse(user);
          const expiresAt = new Date(userData.expiresAt);
          return expiresAt > new Date();
     },

     isAdmin: (): boolean => {
          const user = authUtils.getUser();
          return user?.role === 'Admin';
     },

     logout:()=>{
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
          window.location.href = '/login';
          
     },
};