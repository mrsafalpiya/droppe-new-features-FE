import axios from "axios";

const $axios = axios.create({
  baseURL: "http://localhost:8080",
});

$axios.interceptors.request.use(function (config) {
  // TODO: Add auth token
  return config;
});
export default $axios;
