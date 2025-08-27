import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import nodeHtmlToImage from "node-html-to-image";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const TOKEN = process.env.TOKEN;

app.use(cors());
app.use(express.json());

// Función para convertir un objeto JSON en una cadena HTML estilizada profesionalmente
const jsonToHtml = (endpoint, jsonObject) => {
  // Función auxiliar para capitalizar la primera letra de una cadena
  const capitalize = (s) => {
    if (typeof s !== "string") return s;
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  // Genera el contenido específico basado en el endpoint, si es necesario
  let dynamicContent = "";
  let title = "Resultados de la Consulta";

  if (endpoint.includes("dni/info") && jsonObject && jsonObject.success) {
    const data = jsonObject.data || {};
    title = "Información DNI (Factiliza)";
    dynamicContent = `
      <div class="mb-4 text-center">
          <p class="text-xs text-gray-500">Consulta de ${data.source === "database" ? "Base de Datos" : "Tiempo Real"
      }</p>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
          <div>
              <p class="font-semibold text-gray-600">DNI:</p>
              <p class="text-lg font-bold text-blue-600">${data.dni || "No disponible"
      }</p>
          </div>
          <div>
              <p class="font-semibold text-gray-600">Nombres:</p>
              <p class="text-lg">${capitalize(data.nombres || "")} ${capitalize(data.apellidoPaterno || "")
      } ${capitalize(data.apellidoMaterno || "")}</p>
          </div>
          <div>
              <p class="font-semibold text-gray-600">Fecha de Nacimiento:</p>
              <p>${data.fechaNacimiento || "No disponible"}</p>
          </div>
          <div>
              <p class="font-semibold text-gray-600">Estado Civil:</p>
              <p>${capitalize(data.estadoCivil || "No disponible")}</p>
          </div>
          <div>
              <p class="font-semibold text-gray-600">Sexo:</p>
              <p>${capitalize(data.sexo || "No disponible")}</p>
          </div>
          <div>
              <p class="font-semibold text-gray-600">Restricción:</p>
              <p>${capitalize(data.restriccion || "No disponible")}</p>
          </div>
      </div>
      <hr class="my-6 border-gray-200">
      <div class="text-center">
          <p class="font-semibold text-gray-600">Dirección:</p>
          <p class="text-sm text-gray-700">${capitalize(data.direccion || "No disponible")
      }</p>
      </div>
    `;
  } else if (jsonObject && jsonObject.success === false) {
    title = "Error en la Consulta";
    dynamicContent = `
        <div class="text-center py-8">
            <p class="text-red-600 text-xl font-semibold mb-2">¡Error!</p>
            <p class="text-gray-700">${jsonObject.message || "Ocurrió un error al procesar tu solicitud."
      }</p>
            ${jsonObject.error
        ? `<p class="text-gray-500 text-sm mt-2">Detalle: ${jsonObject.error}</p>`
        : ""
      }
        </div>
    `;
  } else {
    // Si no es un endpoint específico o hay error, muestra el JSON crudo
    const jsonString = JSON.stringify(jsonObject, null, 2);
    dynamicContent = `
      <pre class="bg-gray-50 p-4 rounded-md text-gray-700 text-sm overflow-auto max-h-[400px]"><code>${jsonString}</code></pre>
    `;
  }

  return `
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
            body {
                font-family: 'Inter', sans-serif;
                margin: 0;
                padding: 0;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                background-color: #f0f4f8; /* Un fondo más suave */
            }
            .container-card {
                background-color: #ffffff;
                border-radius: 12px;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
                padding: 2.5rem; /* Aumenta el padding */
                max-width: 650px; /* Aumenta el ancho máximo para más espacio */
                margin: 2rem auto;
                border: 1px solid #e2e8f0;
            }
            .header-title {
                color: #2d3748; /* Color de texto más oscuro */
                margin-bottom: 1.5rem;
                border-bottom: 2px solid #edf2f7; /* Línea separadora */
                padding-bottom: 1rem;
            }
            code {
                background-color: #f8fafc;
                border-radius: 6px;
                padding: 0.5em 0.75em;
            }
            pre {
                white-space: pre-wrap;
                word-wrap: break-word;
            }
            /* Scrollbar invisible para pre */
            pre::-webkit-scrollbar {
                display: none;
            }
            pre {
                -ms-overflow-style: none; /* IE and Edge */
                scrollbar-width: none;  /* Firefox */
            }
        </style>
    </head>
    <body class="bg-gray-50 p-6">
        <div class="container-card">
            <h1 class="text-3xl font-bold header-title text-center">${title}</h1>
            ${dynamicContent}
            <p class="text-xs text-gray-400 mt-6 text-center">Generado por tu API de Railway</p>
        </div>
    </body>
    </html>
  `;
};

// Función reutilizable modificada para enviar datos a Factiliza y devolver una imagen
const getFromFactiliza = async (endpointPath, res) => {
  try {
    const url = `https://api.factiliza.com/v1${endpointPath}?token=${TOKEN}`;
    const response = await fetch(url);
    const data = await response.json();

    // Convierte los datos JSON a HTML, pasando el endpoint para personalización
    const htmlContent = jsonToHtml(endpointPath, data);

    // Genera la imagen a partir del HTML
    const image = await nodeHtmlToImage({
      html: htmlContent,
      quality: 90,
      type: "png",
      encoding: "binary",
      // Añade un selector para capturar solo el div principal y no el fondo entero
      // Para esto, asegurate que tu HTML tiene un div principal con una clase o ID única
      selector: ".container-card", // Captura solo la tarjeta de resultados
      puppeteerArgs: {
        args: ["--no-sandbox", "--disable-setuid-sandbox"], // Necesario para entornos como Railway/Docker
        // Puedes agregar más argumentos si es necesario, como la ruta al ejecutable de Chrome
      },
    });

    // Envía la imagen como respuesta
    res.writeHead(200, { "Content-Type": "image/png" });
    res.end(image, "binary");
  } catch (err) {
    console.error(`Error al procesar solicitud para ${endpointPath}:`, err);
    res.status(500).json({
      error: "Error al procesar la solicitud o generar imagen",
      detalle: err.message,
    });
  }
};

// Rutas tipo GET (como Factiliza)
app.get("/dni", (req, res) => {
  const dni = req.query.dni;
  if (!dni) {
    return res.status(400).json({ error: "Parámetro 'dni' es requerido" });
  }
  getFromFactiliza(`/dni/info/${dni}`, res);
});

app.get("/ruc", (req, res) => {
  const ruc = req.query.ruc;
  if (!ruc) {
    return res.status(400).json({ error: "Parámetro 'ruc' es requerido" });
  }
  getFromFactiliza(`/ruc/info/${ruc}`, res);
});

app.get("/ruc-anexo", (req, res) => {
  const ruc = req.query.ruc;
  if (!ruc) {
    return res.status(400).json({ error: "Parámetro 'ruc' es requerido" });
  }
  getFromFactiliza(`/ruc/anexo/${ruc}`, res);
});

app.get("/ruc-representante", (req, res) => {
  const ruc = req.query.ruc;
  if (!ruc) {
    return res.status(400).json({ error: "Parámetro 'ruc' es requerido" });
  }
  getFromFactiliza(`/ruc/representante/${ruc}`, res);
});

app.get("/cee", (req, res) => {
  const cee = req.query.cee;
  if (!cee) {
    return res.status(400).json({ error: "Parámetro 'cee' es requerido" });
  }
  getFromFactiliza(`/cee/info/${cee}`, res);
});

app.get("/placa", (req, res) => {
  const placa = req.query.placa;
  if (!placa) {
    return res.status(400).json({ error: "Parámetro 'placa' es requerido" });
  }
  getFromFactiliza(`/placa/soat/${placa}`, res);
});

app.get("/licencia", (req, res) => {
  const dni = req.query.dni;
  if (!dni) {
    return res.status(400).json({ error: "Parámetro 'dni' es requerido" });
  }
  getFromFactiliza(`/licencia/info/${dni}`, res);
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`✅ API Factiliza-clon corriendo en puerto ${PORT}`);
});
