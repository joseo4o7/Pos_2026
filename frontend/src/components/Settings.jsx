
import { useEffect, useState } from "react";
import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const initialForm = {
  businessName: "",
  address: "",
  phone: "",
  email: "",
  logo: "",
  currency: "CLP",
  iva: 19,
  timezone: "America/Santiago",
};

export default function Settings({ user }) {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await axios.get(
          `${API_URL}/api/settings`,
          {
            headers: token
              ? { Authorization: `Bearer ${token}` }
              : {},
          }
        );

        if (response.data) {
          setForm({
            ...initialForm,
            ...response.data,
            iva: response.data.iva ?? 19,
          });
        }
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "No se pudo cargar la configuración."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");

      const response = await axios.put(
        `${API_URL}/api/settings`,
        {
          ...form,
          iva: Number(form.iva),
        },
        {
          headers: token
            ? { Authorization: `Bearer ${token}` }
            : {},
        }
      );

      if (response.data?.settings) {
        setForm({
          ...initialForm,
          ...response.data.settings,
          iva: response.data.settings.iva ?? 19,
        });
      }

      setSuccess("Configuración guardada correctamente.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "No se pudo guardar la configuración."
      );
    } finally {
      setSaving(false);
    }
  };

  const fieldStyle = {
    width: "100%",
    boxSizing: "border-box",
    padding: "10px 12px",
    border: "1px solid #d1d5db",
    borderRadius: 8,
    fontSize: 14,
    background: "#ffffff",
    color: "#111827",
  };

  const labelStyle = {
    display: "block",
    fontSize: 13,
    fontWeight: 600,
    marginBottom: 6,
    color: "#374151",
  };

  const sectionStyle = {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  };

  const gridStyle = {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(min(100%, 240px), 1fr))",
    gap: 16,
  };

  if (loading) {
    return (
      <div style={{ padding: 24 }}>
        Cargando configuración...
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        minWidth: 0,
        minHeight: 0,
        overflowY: "auto",
        overflowX: "hidden",
        boxSizing: "border-box",
        padding: 24,
        background: "#f8fafc",
      }}
    >
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <h2
          style={{
            margin: "0 0 8px",
            color: "#111827",
          }}
        >
          Configuración
        </h2>

        <p
          style={{
            margin: "0 0 24px",
            color: "#6b7280",
            fontSize: 14,
          }}
        >
          Administra los datos del negocio y la configuración
          general del sistema.
        </p>

        <form onSubmit={handleSubmit}>
          <section style={sectionStyle}>
            <h3 style={{ margin: "0 0 20px", fontSize: 16 }}>
              Datos del negocio
            </h3>

            <div style={gridStyle}>
              <label>
                <span style={labelStyle}>
                  Nombre del negocio
                </span>
                <input
                  style={fieldStyle}
                  name="businessName"
                  value={form.businessName}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                <span style={labelStyle}>Dirección</span>
                <input
                  style={fieldStyle}
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                />
              </label>

              <label>
                <span style={labelStyle}>Teléfono</span>
                <input
                  style={fieldStyle}
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                />
              </label>

              <label>
                <span style={labelStyle}>
                  Correo electrónico
                </span>
                <input
                  style={fieldStyle}
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                />
              </label>

              <label style={{ gridColumn: "1 / -1" }}>
                <span style={labelStyle}>
                  URL del logo (opcional)
                </span>
                <input
                  style={fieldStyle}
                  name="logo"
                  value={form.logo}
                  onChange={handleChange}
                  placeholder="https://..."
                />
              </label>
            </div>
          </section>

          <section style={sectionStyle}>
            <h3 style={{ margin: "0 0 20px", fontSize: 16 }}>
              Configuración general
            </h3>

            <div style={gridStyle}>
              <label>
                <span style={labelStyle}>Moneda</span>
                <select
                  style={fieldStyle}
                  name="currency"
                  value={form.currency}
                  onChange={handleChange}
                >
                  <option value="CLP">
                    Peso chileno (CLP)
                  </option>
                  <option value="USD">
                    Dólar estadounidense (USD)
                  </option>
                  <option value="ARS">
                    Peso argentino (ARS)
                  </option>
                  <option value="PEN">
                    Sol peruano (PEN)
                  </option>
                </select>
              </label>

              <label>
                <span style={labelStyle}>IVA (%)</span>
                <input
                  style={fieldStyle}
                  type="number"
                  name="iva"
                  min="0"
                  max="100"
                  step="0.1"
                  value={form.iva}
                  onChange={handleChange}
                  required
                />
              </label>

              <label style={{ gridColumn: "1 / -1" }}>
                <span style={labelStyle}>Zona horaria</span>
                <select
                  style={fieldStyle}
                  name="timezone"
                  value={form.timezone}
                  onChange={handleChange}
                >
                  <option value="America/Santiago">
                    Chile continental (Santiago)
                  </option>
                  <option value="America/Punta_Arenas">
                    Magallanes
                  </option>
                  <option value="America/Easter">
                    Isla de Pascua
                  </option>
                  <option value="America/Buenos_Aires">
                    Argentina
                  </option>
                  <option value="America/Lima">Perú</option>
                  <option value="UTC">UTC</option>
                </select>
              </label>
            </div>
          </section>

          {error && (
            <p
              role="alert"
              style={{
                padding: 12,
                borderRadius: 8,
                background: "#fef2f2",
                color: "#b91c1c",
              }}
            >
              {error}
            </p>
          )}

          {success && (
            <p
              role="status"
              style={{
                padding: 12,
                borderRadius: 8,
                background: "#f0fdf4",
                color: "#166534",
              }}
            >
              {success}
            </p>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              paddingBottom: 24,
            }}
          >
            <button
              type="submit"
              disabled={saving}
              style={{
                border: "none",
                borderRadius: 8,
                padding: "12px 22px",
                background: saving ? "#9ca3af" : "#2563eb",
                color: "#ffffff",
                fontWeight: 600,
                cursor: saving ? "wait" : "pointer",
              }}
            >
              {saving
                ? "Guardando..."
                : "Guardar configuración"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
