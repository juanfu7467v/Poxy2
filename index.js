import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const TOKEN = process.env.TOKEN;

app.use(cors());
app.use(express.json());

/**
 * Función para consultar Factiliza con manejo correcto del token
 */
const getFromFactiliza = async (endpointPath, res) => {
  try {
    const url = `https://api.factiliza.com/v1${endpointPath}`;
    console.log("🔗 Solicitando:", url);

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    // ✅ Si Factiliza responde correctamente
    if (response.data && response.data.success !== false) {
      return res.status(200).json(response.data);
    }

    // ⚠️ Si Factiliza devuelve error
    console.error("⚠️ Error api pe app:", response.data);
    return res.status(400).json({
      success: false,
      message: "Error en la respuesta",
      detalle: response.data,
    });
  } catch (err) {
    console.error(`❌ Error al procesar solicitud para ${endpointPath}:`, err.response?.data || err.message);
    res.status(err.response?.status || 500).json({
      success: false,
      message: "Error interno al procesar la solicitud",
      detalle: err.response?.data || err.message,
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
 * Ruta default para probar si el backend está corriendo
 */
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🚀 API Consulta pe-clon funcionando correctamente",
  });
});

/**
 * Iniciar servidor
 */
app.listen(PORT, () => {
  console.log(`✅ API Consulta pe-clon corriendo en puerto ${PORT}`);
});
