import axios from "axios";

export default axios.create({
  baseURL: "https://eco-challenger-hd5r.vercel.app/api/eco-challenge",
  headers: {
    "Content-type": "application/json",
  },
  withCredentials: true,
});
