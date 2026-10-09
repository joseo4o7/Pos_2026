function Step3Settings({
  data,
  setData,
  next,
  back,
}) {

  return (

    <div>

      <h2>⚙ Configuración Inicial</h2>

      <br />

      <label>Moneda</label>

      <select
        value={data.currency}
        onChange={(e) =>
          setData({
            ...data,
            currency: e.target.value,
          })
        }
      >

        <option value="CLP">
          Peso Chileno (CLP)
        </option>

        <option value="USD">
          Dólar (USD)
        </option>

        <option value="EUR">
          Euro (EUR)
        </option>

      </select>

      <br /><br />

      <label>IVA (%)</label>

      <input
        type="number"
        value={data.iva}
        onChange={(e) =>
          setData({
            ...data,
            iva: Number(e.target.value),
          })
        }
      />

      <br /><br />

      <label>Zona Horaria</label>

      <select
        value={data.timezone}
        onChange={(e) =>
          setData({
            ...data,
            timezone: e.target.value,
          })
        }
      >

        <option value="America/Santiago">
          Chile
        </option>

        <option value="America/Lima">
          Perú
        </option>

        <option value="America/Bogota">
          Colombia
        </option>

      </select>

      <br /><br />

      <button onClick={back}>
        ← Atrás
      </button>

      {" "}

      <button onClick={next}>
        Finalizar →
      </button>

    </div>

  );

}

export default Step3Settings;