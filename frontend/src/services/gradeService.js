import axios from "axios";
const API_URL = "http://localhost:3000/api/grades";

const getGradesByActivity = (activityId) => {
  const token = localStorage.getItem("token");
  return axios.get(`${API_URL}/activity/${activityId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

const updateGrade = (id, data) => {
  const token = localStorage.getItem("token");
  return axios.put(`${API_URL}/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

const createGrade = (data) => {
  const token = localStorage.getItem("token");
  return axios.post(API_URL, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export default {
  getGradesByActivity,
  updateGrade,
  createGrade,
};
