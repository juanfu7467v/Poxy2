import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const TOKEN = process.env.TOKEN;

app.use(cors());
app.use(express.json());

/**
 * Función para consultar Factiliza con manejo de errores
 */
const getFromFactiliza = async (endpointPath, res) => {
  try {
    const url = `https://api.factiliza.com/v1${endpointPath}?token=${TOKEN}`;
    console.log("🔗 Solicitando:", url);

    const response = await fetch(url);
    const contentType = response.headers.get("content-type");
    let data;

    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();
      console.error("⚠️ Respuesta no-JSON:", text);
      return res.status(response.status).json({
        success: false,
        message: "Respuesta inesperada desde Factiliza",
        detalle: text,
      });
    }

    if (response.status !== 200 || data.success === false || data.error) {
      console.error("⚠️ Error en API Factiliza:", data);
      return res.status(response.status).json({
        success: false,
        message: "Error en la respuesta de Factiliza",
        detalle: data,
      });
    }

    res.status(200).json(data);
  } catch (err) {
    console.error(`❌ Error al procesar ${endpointPath}:`, err);
    res.status(500).json({
      success: false,
      message: "Error interno en el servidor",
      detalle: err.message,
    });
  }
};

/**
 * Endpoints disponibles
 */
app.get("/dni", (req, res) => {
  const dni = req.query.dni;
  if (!dni) {
    return res
      .status(400)
      .json({ success: false, message: "Parámetro 'dni' es requerido" });
  }
  getFromFactiliza(`/dni/info/${dni}`, res);
});

app.get("/ruc", (req, res) => {
  const ruc = req.query.ruc;
  if (!ruc) {
    return res
      .status(400)
      .json({ success: false, message: "Parámetro 'ruc' es requerido" });
  }
  getFromFactiliza(`/ruc/info/${ruc}`, res);
});

app.get("/ruc-anexo", (req, res) => {
  const ruc = req.query.ruc;
  if (!ruc) {
    return res
      .status(400)
      .json({ success: false, message: "Parámetro 'ruc' es requerido" });
  }
  getFromFactiliza(`/ruc/anexo/${ruc}`, res);
});

app.get("/ruc-representante", (req, res) => {
  const ruc = req.query.ruc;
  if (!ruc) {
    return res
      .status(400)
      .json({ success: false, message: "Parámetro 'ruc' es requerido" });
  }
  getFromFactiliza(`/ruc/representante/${ruc}`, res);
});

app.get("/cee", (req, res) => {
  const cee = req.query.cee;
  if (!cee) {
    return res
      .status(400)
      .json({ success: false, message: "Parámetro 'cee' es requerido" });
  }
  getFromFactiliza(`/cee/info/${cee}`, res);
});

app.get("/placa", (req, res) => {
  const placa = req.query.placa;
  if (!placa) {
    return res
      .status(400)
      .json({ success: false, message: "Parámetro 'placa' es requerido" });
  }
  getFromFactiliza(`/placa/soat/${placa}`, res);
});

app.get("/licencia", (req, res) => {
  const dni = req.query.dni;
  if (!dni) {
    return res
      .status(400)
      .json({ success: false, message: "Parámetro 'dni' es requerido" });
  }
  getFromFactiliza(`/licencia/info/${dni}`, res);
});

/**
 * Ruta default
 */
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🚀 API Factiliza-proxy funcionando correctamente",
  });
});

/**
 * Iniciar servidor
 */
app.listen(PORT, () => {
  console.log(`✅ API Factiliza-proxy corriendo en puerto ${PORT}`);
});
