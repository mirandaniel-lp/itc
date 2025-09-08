import axios from "axios";

const API_URL = "http://localhost:3000/api/auth";

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

class AuthenticationService {
  async login(email, password) {
    try {
      const response = await apiClient.post("/login", { email, password });
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async register(userData) {
    try {
      const response = await apiClient.post("/register", {
        email: userData.email,
        password: userData.password,
        roleId: 2,
      });

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }

  getCurrentUser() {
    const token = localStorage.getItem("token");
    return token ? true : false;
  }

  isAuthenticated() {
    return !!localStorage.getItem("token");
  }

  handleError(error) {
    if (error.response) {
      return {
        status: error.response.status,
        message: error.response.data.error || "An error occurred",
      };
    } else if (error.request) {
      return {
        status: 503,
        message: "Servicio no disponible",
      };
    } else {
      return {
        status: 500,
        message: error.message,
      };
    }
  }
}

export default new AuthenticationService();
