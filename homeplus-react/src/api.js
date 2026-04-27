const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

const getToken = () => localStorage.getItem("token");

const getHeaders = (includeAuth = true) => {
  const headers = { "Content-Type": "application/json" };
  if (includeAuth && getToken()) {
    headers["Authorization"] = `Bearer ${getToken()}`;
  }
  return headers;
};

const handleResponse = async (response) => {
  let data = {};
  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    const error = data.message || `Request failed with status ${response.status}`;
    throw new Error(error);
  }

  return data;
};

const request = async (path, options = {}) => {
  try {
    const response = await fetch(`${BASE_URL}${path}`, options);
    return await handleResponse(response);
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        `Cannot connect to backend API at ${BASE_URL}. Start backend server and try again.`
      );
    }
    throw error;
  }
};

export const api = {
  signup: (data) =>
    request("/auth/signup", {
      method: "POST",
      headers: getHeaders(false),
      body: JSON.stringify(data),
    }),

  login: (data) =>
    request("/auth/login", {
      method: "POST",
      headers: getHeaders(false),
      body: JSON.stringify(data),
    }),

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("user");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userType");
    localStorage.removeItem("userData");
    localStorage.removeItem("userName");
  },

  getUserPropertyHistory: (email) =>
    request(`/properties/user/${encodeURIComponent(email)}/history`, {
      headers: getHeaders(true),
    }),

  createProperty: (data) =>
    request("/properties", {
      method: "POST",
      headers: getHeaders(true),
      body: JSON.stringify(data),
    }),

  getUserProperties: (email) =>
    request(`/properties/user/${email}`, {
      headers: getHeaders(true),
    }),

  getAllProperties: () =>
    request("/properties", {
      headers: getHeaders(true),
    }),

  approveProperty: (id) =>
    request(`/properties/${id}/approve`, {
      method: "PUT",
      headers: getHeaders(true),
    }),

  rejectProperty: (id) =>
    request(`/properties/${id}/reject`, {
      method: "PUT",
      headers: getHeaders(true),
    }),

  saveEstimate: (propertyId, data) =>
    request(`/admin/estimate/${propertyId}`, {
      method: "POST",
      headers: getHeaders(true),
      body: JSON.stringify(data),
    }),

  calculatePropertyEstimation: (data) =>
    request(`/admin/estimate/calculate`, {
      method: "POST",
      headers: getHeaders(true),
      body: JSON.stringify(data),
    }),

  getEstimate: (propertyId) =>
    request(`/admin/estimate/${propertyId}`, {
      headers: getHeaders(true),
    }),

  isAuthenticated: () => !!getToken(),

  getToken: getToken,
};