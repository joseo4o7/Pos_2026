import { useState } from "react";
import axios from "axios";

// Definimos la URL base con respaldo (fallback) por si Vite no lee la variable .env
const API_URL = import.meta.env.VITE_API_URL || "https://pos-2026-yta1.onrender.com";

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {
    try {
      const response = await axios.post(
        `${API_URL}/api/users/login`,
        {
          username,
          password,
        }
      );

      console.log("LOGIN CORRECTO:", response.data);

      alert("Bienvenido " + response.data.user.fullName);

      // enviamos usuario Y token a App.jsx
      onLogin(response.data.user, response.data.token);

    } catch (error) {
      console.error("ERROR LOGIN:", error);
      console.error(
        "RESPUESTA SERVIDOR:",
        error.response?.data
      );

      alert(
        error.response?.data?.message ||
        "Error al iniciar sesión"
      );
    }
  };

  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "80px auto",
        padding: "30px",
        background: "white",
        borderRadius: "10px",
      }}
    >
      <h1 style={{ textAlign: "center" }}>
        PUNTO ELECTRÓNICO
      </h1>

      <br />

      <input
        type="text"
        placeholder="Usuario"
        value={username}
        onChange={(e) =>
          setUsername(e.target.value)
        }
        style={{
          width: "100%",
          padding: "12px",
          boxSizing: "border-box",
        }}
      />

      <br />
      <br />

      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) =>
          setPassword(e.target.value)
        }
        style={{
          width: "100%",
          padding: "12px",
          boxSizing: "border-box",
        }}
      />

      <br />
      <br />

      <button
        onClick={login}
        style={{
          width: "100%",
          padding: "12px",
          cursor: "pointer",
        }}
      >
        Ingresar
      </button>
    </div>
  );
}

export default Login;