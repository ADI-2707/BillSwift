export const API_URL = "http://127.0.0.1:8000";
import axios from "axios";

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403 && error.response?.data?.detail === "ACCOUNT_DEACTIVATED") {
      localStorage.clear();
      alert("Your access has been revoked!");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);