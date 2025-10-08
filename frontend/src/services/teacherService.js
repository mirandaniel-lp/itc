import axios from "axios";

const API_URL = "http://localhost:3000/api/teachers";

const getAll = () => {
  const token = localStorage.getItem("token");
  return axios
    .get(API_URL, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((res) => res.data.teachers);
};

const getById = (id) => {
  const token = localStorage.getItem("token");
  return axios
    .get(`${API_URL}/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((res) => res.data.teacher);
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

const getCourses = (teacherId) => {
  const token = localStorage.getItem("token");
  return fetch(`${API_URL}/${teacherId}/courses`, {
    headers: { Authorization: `Bearer ${token}` },
  }).then((res) => res.json());
};

export default {
  getAll,
  getById,
  create,
  update,
  remove,
  getCourses,
};
