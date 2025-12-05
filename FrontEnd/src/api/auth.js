import axios from "axios";
import { API_URL } from "./base";

export const signup = async (data) => {
  return axios.post(`${API_URL}/auth/signup`, data);
};

export const login = async (data) => {
  return axios.post(`${API_URL}/auth/login`, data);
};