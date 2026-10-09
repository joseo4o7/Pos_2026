import { useState } from "react";

import Step1Business from "../components/setup/Step1Business";
import Step2Admin from "../components/setup/Step2Admin";
import Step3Settings from "../components/setup/Step3Settings";
import Step4Finish from "../components/setup/Step4Finish";

function Setup({ onFinish }) {
  const [step, setStep] = useState(1);

  const [businessData, setBusinessData] = useState({
    businessName: "",
    address: "",
    phone: "",
    email: "",
    logo: null,
  });

  const [adminData, setAdminData] = useState({
    fullName: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  const [settingsData, setSettingsData] = useState({
    currency: "CLP",
    timezone: "America/Santiago",
    iva: 19,
  });

  return (
    <div
      style={{
        maxWidth: "700px",
        margin: "20px auto",      // 👈 Reducimos el margen superior
        maxHeight: "90vh",        // 👈 Limita la tarjeta a casi el alto de la pantalla
        overflowY: "auto",        // 👈 Permite scroll vertical si la pantalla es chica
        padding: "30px",
        background: "#fff",
        borderRadius: "10px",
        boxShadow: "0 4px 10px rgba(0,0,0,0.1)", // (Opcional) Da mejor acabado visual
      }}
    >
      <h1 style={{ textAlign: "center", marginTop: 0 }}>
        Configuración Inicial
      </h1>

      <p style={{ textAlign: "center" }}>
        Paso {step} de 4
      </p>

      {step === 1 && (
        <Step1Business
          data={businessData}
          setData={setBusinessData}
          next={() => setStep(2)}
        />
      )}

      {step === 2 && (
        <Step2Admin
          data={adminData}
          setData={setAdminData}
          next={() => setStep(3)}
          back={() => setStep(1)}
        />
      )}

      {step === 3 && (
        <Step3Settings
          data={settingsData}
          setData={setSettingsData}
          next={() => setStep(4)}
          back={() => setStep(2)}
        />
      )}

      {step === 4 && (
        <Step4Finish
          businessData={businessData}
          adminData={adminData}
          settingsData={settingsData}
          back={() => setStep(3)}
          onFinish={onFinish}
        />
      )}
    </div>
  );
}

export default Setup;