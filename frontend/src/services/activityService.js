import axios from "axios";

const API_URL = "http://localhost:3000/api/activities";

const getAll = () => {
  const token = localStorage.getItem("token");
  return axios
    .get(API_URL, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((res) => res.data.activities);
};

const getById = (id) => {
  const token = localStorage.getItem("token");
  return axios
    .get(`${API_URL}/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((res) => res.data);
};

const create = (data) => {
  const token = localStorage.getItem("token");
  return axios.post(API_URL, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

const update = (id, data) => {
  const token = localStorage.getItem("token");
  return axios.put(`${API_URL}/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

const remove = (id) => {
  const token = localStorage.getItem("token");
  return axios.delete(`${API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

const getActivitiesByCourse = (courseId) => {
  const token = localStorage.getItem("token");
  return axios
    .get(`${API_URL}/course/${courseId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((res) => res.data.activities);
};

export default {
  getAll,
  getById,
  create,
  update,
  remove,
  getActivitiesByCourse,
};
