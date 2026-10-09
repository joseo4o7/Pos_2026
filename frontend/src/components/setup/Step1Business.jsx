function Step1Business({
  data,
  setData,
  next,
}) {

  const handleNext = () => {

    if (!data.businessName.trim()) {

      alert("Debe ingresar el nombre del negocio");

      return;

    }

    next();

  };

  return (

    <div>

      <h2>🏪 Datos del Negocio</h2>

      <br />

      <label>Nombre del negocio *</label>

      <input
        type="text"
        value={data.businessName}
        onChange={(e) =>
          setData({
            ...data,
            businessName: e.target.value,
          })
        }
      />

      <br /><br />

      <label>Dirección</label>

      <input
        type="text"
        value={data.address}
        onChange={(e) =>
          setData({
            ...data,
            address: e.target.value,
          })
        }
      />

      <br /><br />

      <label>Teléfono</label>

      <input
        type="text"
        value={data.phone}
        onChange={(e) =>
          setData({
            ...data,
            phone: e.target.value,
          })
        }
      />

      <br /><br />

      <label>Correo</label>

      <input
        type="email"
        value={data.email}
        onChange={(e) =>
          setData({
            ...data,
            email: e.target.value,
          })
        }
      />

      <br /><br />

      <label>Logo (Opcional)</label>

      <input
        type="file"
        accept="image/*"
        onChange={(e) =>
          setData({
            ...data,
            logo: e.target.files[0],
          })
        }
      />

      <br /><br />

      <button onClick={handleNext}>
        Siguiente →
      </button>

    </div>

  );

}

export default Step1Business;