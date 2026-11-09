import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

export const analyzeText = async (text) => {
  const response = await axios.post(`${API_BASE}/api/analyze`, { text });
  return response.data;
};
