import axios from "axios";

// One axios instance for the whole app.
//
// Every component used to declare its own API_BASE constant and repeat
// `withCredentials: true` on each call. Both are easy to forget: without
// withCredentials the auth cookie is never sent and the request comes back 401
// with nothing in the UI to explain why.
//
// This module is shared, but VITE_API_URL is not: Vite inlines import.meta.env
// while building whichever app imported this file, reading that app's own .env.
// So the patient site and the dashboard can point at different API origins from
// one source file. See each app's .env.example. The fallback matches PORT=4000
// in backend/config/config.env.example.
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api/v1",
  withCredentials: true,
});
