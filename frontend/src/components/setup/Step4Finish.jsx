import axios from "axios";

function Step4Finish({
  businessData,
  adminData,
  settingsData,
  back,
  onFinish,
}) {

  const installSystem = async () => {

    try {

      await axios.post(

        `${import.meta.env.VITE_API_URL}/api/settings/initialize`,

        {

          businessName: businessData.businessName,

          address: businessData.address,

          phone: businessData.phone,

          email: businessData.email,

          logo: "",

          currency: settingsData.currency,

          iva: settingsData.iva,

          timezone: settingsData.timezone,

          fullName: adminData.fullName,

          username: adminData.username,

          password: adminData.password,

        }

      );

    alert("✅ Sistema instalado correctamente.");

if (onFinish) {
  await onFinish();
}

      // Más adelante aquí mostraremos el Login

    } catch (error) {

      console.log(error);

      alert(
        error.response?.data?.message ||
        "Error al instalar el sistema."
      );

    }

  };

  return (

    <div>

      <h2>🎉 Resumen de la Instalación</h2>

      <hr />

      <h3>🏪 Negocio</h3>

      <p>
        <strong>Nombre:</strong> {businessData.businessName}
      </p>

      <p>
        <strong>Dirección:</strong> {businessData.address || "-"}
      </p>

      <p>
        <strong>Teléfono:</strong> {businessData.phone || "-"}
      </p>

      <p>
        <strong>Correo:</strong> {businessData.email || "-"}
      </p>

      <hr />

      <h3>👤 Super Administrador</h3>

      <p>
        <strong>Nombre:</strong> {adminData.fullName}
      </p>

      <p>
        <strong>Usuario:</strong> {adminData.username}
      </p>

      <hr />

      <h3>⚙ Configuración</h3>

      <p>
        <strong>Moneda:</strong> {settingsData.currency}
      </p>

      <p>
        <strong>IVA:</strong> {settingsData.iva}%
      </p>

      <p>
        <strong>Zona Horaria:</strong> {settingsData.timezone}
      </p>

      <br />

      <button onClick={back}>
        ← Atrás
      </button>

      {" "}

      <button onClick={installSystem}>
        🚀 Instalar Sistema
      </button>

    </div>

  );

}

export default Step4Finish;