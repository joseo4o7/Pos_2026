import { useState } from "react";

function Step2Admin({
  data,
  setData,
  next,
  back,
}) {

  const [showPassword, setShowPassword] = useState(false);

  const handleNext = () => {

    if (!data.fullName.trim()) {
      alert("Ingrese el nombre completo");
      return;
    }

    if (!data.username.trim()) {
      alert("Ingrese un usuario");
      return;
    }

    if (data.password.length < 8) {
      alert("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    if (data.password !== data.confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }

    next();

  };

  const passwordStrength = () => {

    let score = 0;

    if (data.password.length >= 8) score++;
    if (/[A-Z]/.test(data.password)) score++;
    if (/[0-9]/.test(data.password)) score++;
    if (/[^A-Za-z0-9]/.test(data.password)) score++;

    if (score <= 1) return "🔴 Débil";
    if (score <= 3) return "🟡 Media";

    return "🟢 Fuerte";

  };

  return (

    <div>

      <h2>👤 Super Administrador</h2>

      <br />

      <label>Nombre completo *</label>

      <input
        type="text"
        value={data.fullName}
        onChange={(e) =>
          setData({
            ...data,
            fullName: e.target.value,
          })
        }
      />

      <br /><br />

      <label>Usuario *</label>

      <input
        type="text"
        value={data.username}
        onChange={(e) =>
          setData({
            ...data,
            username: e.target.value,
          })
        }
      />

      <br /><br />

      <label>Contraseña *</label>

      <input
        type={showPassword ? "text" : "password"}
        value={data.password}
        onChange={(e) =>
          setData({
            ...data,
            password: e.target.value,
          })
        }
      />

      <br />

      <label>

        <input
          type="checkbox"
          checked={showPassword}
          onChange={() =>
            setShowPassword(!showPassword)
          }
        />

        Mostrar contraseña

      </label>

      <br /><br />

      <strong>

        Seguridad:

        {" "}

        {passwordStrength()}

      </strong>

      <br /><br />

      <label>Confirmar contraseña *</label>

      <input
        type={showPassword ? "text" : "password"}
        value={data.confirmPassword}
        onChange={(e) =>
          setData({
            ...data,
            confirmPassword: e.target.value,
          })
        }
      />

      <br /><br />

      <button onClick={back}>
        ← Atrás
      </button>

      {" "}

      <button onClick={handleNext}>
        Siguiente →
      </button>

    </div>

  );

}

export default Step2Admin;