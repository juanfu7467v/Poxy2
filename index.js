import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const TOKEN = process.env.TOKEN;

app.use(cors());
app.use(express.json());

/**
 * Función para consultar Factiliza con manejo de errores avanzado
 */
const getFromFactiliza = async (endpointPath, res) => {
  try {
    const url = `https://api.factiliza.com/v1${endpointPath}?token=${TOKEN}`;
    console.log("🔗 Solicitando:", url);

    const response = await fetch(url);
    const contentType = response.headers.get("content-type");
    let data;

    // Verifica si la respuesta es JSON
    if (contentType && contentType.includes("application/json")) {
      try {
        data = await response.json();
      } catch (err) {
        console.error("❌ Error parseando JSON:", err);
        return res.status(500).json({
          success: false,
          message: "La respuesta de Factiliza no es un JSON válido",
        });
      }
    } else {
      // Si no es JSON, leemos como texto y devolvemos error
      const text = await response.text();
      console.error("⚠️ Respuesta no-JSON de Factiliza:", text);
      return res.status(response.status).json({
        success: false,
        message: "Respuesta inesperada desde Factiliza",
        detalle: text,
      });
    }

    // Si Factiliza devuelve error en el JSON
    if (data.error || data.success === false) {
      console.error("⚠️ Error de Factiliza:", data);
      return res.status(response.status).json({
        success: false,
        message: "Error en la respuesta de Factiliza",
        detalle: data,
      });
    }

    // ✅ Devolver data válida
    res.status(response.status).json(data);
  } catch (err) {
    console.error(`❌ Error al procesar solicitud para ${endpointPath}:`, err);
    res.status(500).json({
      success: false,
      message: "Error interno al procesar la solicitud",
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
 * Ruta default para probar si el backend está corriendo
 */
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🚀 API Factiliza-clon funcionando correctamente",
  });
});

/**
 * Iniciar servidor
 */
app.listen(PORT, () => {
  console.log(`✅ API Factiliza-clon corriendo en puerto ${PORT}`);
});
