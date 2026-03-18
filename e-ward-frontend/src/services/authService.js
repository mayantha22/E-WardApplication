// src/services/authService.js
import api from "./api";

const TOKEN_KEY = "eward_token";
const USER_KEY = "eward_user";

/* async function login(username, password) {
  // Call backend: /api/auth/login → returns { token, user }
  const res = await api.post("/auth/login", { username, password });

  // Ensure backend returned what we expect
   if (!res?.token) {
    throw new Error("Login failed: missing token in response");
  }

  // ✅ Save JWT and user info
  localStorage.setItem(TOKEN_KEY, res.token);
  localStorage.setItem(USER_KEY, JSON.stringify(res.user));

  return { token: res.token, user: res.user };
} */

  async function login(username, password) {
  const res = await api.post("/auth/login", { username, password });

  if (!res?.token) {
    throw new Error("Login failed: missing token in response");
  }

  // 1. Get the basic user data
  let userData = res.user;

  try {
    // 2. FETCH STAFF DETAILS: Use an endpoint to find staff by User ID
    // Check if you have an endpoint like /api/staff/user/{id}
    const staffRes = await api.get(`/staff/user/${userData.id}`);
      
    // 3. Attach staffId to the user object
    userData = {
      ...userData,
      staffId: staffRes.data.id, // Now user.staffId exists!
      fullName: staffRes.data.fullName || userData.fullName
    };
  } catch (err) {
    
    console.warn("Could not fetch staff profile for this user", err);
  }

  localStorage.setItem(TOKEN_KEY, res.token);
  localStorage.setItem(USER_KEY, JSON.stringify(userData));

  return { token: res.token, user: userData };
}

function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function getCurrentUser() {
  const raw = localStorage.getItem(USER_KEY);
  
    return raw ? JSON.parse(raw) : null;
  
}

async function forgotPassword(email) {
  return await api.post("/auth/forgot-password", { email });
}

async function resetPassword(token, password) {
  return await api.post("/auth/reset-password", { token, password });
}


export default {
  login,
  logout,
  getToken,
  getCurrentUser,
  forgotPassword,
  resetPassword
};
