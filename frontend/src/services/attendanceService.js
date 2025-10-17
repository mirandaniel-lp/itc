import axios from "axios";

const API_URL = "http://localhost:3000/api/attendance";

const auth = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

const getRoster = (courseId, date) =>
  axios
    .get(`${API_URL}/roster`, { params: { courseId, date }, headers: auth() })
    .then((r) => r.data);

const getStats = (courseId, date) =>
  axios
    .get(`${API_URL}/stats`, { params: { courseId, date }, headers: auth() })
    .then((r) => r.data);

const markBulk = (courseId, date, items) =>
  axios.post(`${API_URL}/bulk`, { courseId, date, items }, { headers: auth() });

const saveGrid = (courseId, date, rows) =>
  axios.post(
    `${API_URL}/save-grid`,
    { courseId, date, rows },
    { headers: auth() }
  );

const updateOne = (id, data) =>
  axios.put(`${API_URL}/${id}`, data, { headers: auth() });

export default { getRoster, getStats, markBulk, saveGrid, updateOne };
