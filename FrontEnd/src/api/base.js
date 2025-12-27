export const API_URL = "http://127.0.0.1:8000";
import axios from "axios";

// This monitors every response from the backend
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the backend returns 403 (Forbidden) because the account is inactive
    if (error.response?.status === 403 && error.response?.data?.detail === "ACCOUNT_DEACTIVATED") {
      localStorage.clear(); // Clear token and role
      alert("Your access has been revoked!");
      window.location.href = "/"; // Force redirect to home
    }
    return Promise.reject(error);
  }
);