import { io } from "socket.io-client";

// URL base con respaldo a Render
const API_URL = import.meta.env.VITE_API_URL || "https://pos-2026-yta1.onrender.com";

const socket = io(API_URL);

export default socket;