import axios from "axios";

const $axios = axios.create({
  baseURL: "http://localhost:3000",
});

$axios.interceptors.request.use(function (config) {
  // TODO: Add auth token
  return config;
});
export default $axios;
