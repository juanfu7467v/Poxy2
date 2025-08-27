import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const TOKEN = process.env.TOKEN;

app.use(cors());
app.use(express.json());

// Nueva función para obtener datos de Factiliza y devolverlos como JSON
const getFromFactiliza = async (endpointPath, res) => {
  try {
    const url = `https://api.factiliza.com/v1${endpointPath}?token=${TOKEN}`;
    const response = await fetch(url);
    const data = await response.json();

    // ✅ Devuelve la respuesta directamente
    res.status(response.status).json(data);
  } catch (err) {
    console.error(`Error al procesar solicitud para ${endpointPath}:`, err);
    res.status(500).json({
      success: false,
      message: "Error al procesar la solicitud",
      detalle: err.message,
    });
  }
};

// Rutas actualizadas para devolver JSON
app.get("/dni", (req, res) => {
  const dni = req.query.dni;
  if (!dni) {
    return res.status(400).json({ success: false, message: "Parámetro 'dni' es requerido" });
  }
  getFromFactiliza(`/dni/info/${dni}`, res);
});

app.get("/ruc", (req, res) => {
  const ruc = req.query.ruc;
  if (!ruc) {
    return res.status(400).json({ success: false, message: "Parámetro 'ruc' es requerido" });
  }
  getFromFactiliza(`/ruc/info/${ruc}`, res);
});

app.get("/ruc-anexo", (req, res) => {
  const ruc = req.query.ruc;
  if (!ruc) {
    return res.status(400).json({ success: false, message: "Parámetro 'ruc' es requerido" });
  }
  getFromFactiliza(`/ruc/anexo/${ruc}`, res);
});

app.get("/ruc-representante", (req, res) => {
  const ruc = req.query.ruc;
  if (!ruc) {
    return res.status(400).json({ success: false, message: "Parámetro 'ruc' es requerido" });
  }
  getFromFactiliza(`/ruc/representante/${ruc}`, res);
});

app.get("/cee", (req, res) => {
  const cee = req.query.cee;
  if (!cee) {
    return res.status(400).json({ success: false, message: "Parámetro 'cee' es requerido" });
  }
  getFromFactiliza(`/cee/info/${cee}`, res);
});

app.get("/placa", (req, res) => {
  const placa = req.query.placa;
  if (!placa) {
    return res.status(400).json({ success: false, message: "Parámetro 'placa' es requerido" });
  }
  getFromFactiliza(`/placa/soat/${placa}`, res);
});

app.get("/licencia", (req, res) => {
  const dni = req.query.dni;
  if (!dni) {
    return res.status(400).json({ success: false, message: "Parámetro 'dni' es requerido" });
  }
  getFromFactiliza(`/licencia/info/${dni}`, res);
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`✅ API Factiliza-clon corriendo en puerto ${PORT}`);
});
