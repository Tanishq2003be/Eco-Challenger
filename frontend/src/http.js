import axios from "axios";

export default axios.create({
  baseURL: "http://localhost:8000/api/eco-challenge",
  headers: {
    "Content-type": "application/json",
  },
  withCredentials: true,
});
