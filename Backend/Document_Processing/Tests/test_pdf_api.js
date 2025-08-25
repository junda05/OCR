const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

/**
 * Función para probar el endpoint de procesamiento de PDF
 * @param {string} pdfPath - Ruta al archivo PDF
 * @param {string} apiUrl - URL del endpoint
 */
async function testPdfProcessing(pdfPath, apiUrl) {
  try {
    // Verificar que el archivo existe
    if (!fs.existsSync(pdfPath)) {
      console.error(`Error: El archivo ${pdfPath} no existe`);
      return;
    }
    
    console.log(`Enviando archivo: ${pdfPath}`);
    console.log(`Endpoint: ${apiUrl}`);
    
    // Crear un objeto FormData para enviar el archivo
    const formData = new FormData();
    formData.append('archivo', fs.createReadStream(pdfPath));
    
    // Enviar la solicitud
    console.log('Enviando solicitud...');
    const response = await axios.post(apiUrl, formData, {
      headers: {
        ...formData.getHeaders()
      },
      maxBodyLength: Infinity,
      maxContentLength: Infinity
    });
    
    // Mostrar resultados
    console.log('\n=== RESPUESTA DEL SERVIDOR ===');
    console.log('Estado:', response.status);
    console.log('Nombre del archivo:', response.data.nombre_archivo);
    console.log('Tamaño:', response.data.tamaño_bytes, 'bytes');
    console.log('Método utilizado:', response.data.metodo);
    console.log('\n--- Primeros 500 caracteres del texto extraído ---');
    console.log(response.data.texto_extraido.substring(0, 500) + '...');
    console.log('\n=== FIN DE LA RESPUESTA ===');
    
  } catch (error) {
    console.error('Error al procesar el PDF:');
    
    if (error.response) {
      // El servidor respondió con un código de estado fuera del rango 2xx
      console.error('Estado:', error.response.status);
      console.error('Datos:', error.response.data);
    } else if (error.request) {
      // La solicitud fue realizada pero no se recibió respuesta
      console.error('No se recibió respuesta del servidor');
      console.error(error.message);
    } else {
      // Error en la configuración de la solicitud
      console.error('Error:', error.message);
    }
    
    console.error('\nDetalles completos del error:');
    console.error(error);
  }
}

const PDF_PATH = path.resolve(__dirname, '../Utils/PDFs/Text/ElPrincipito.pdf');
const API_URL = 'http://localhost:5800/api/v1/documentos/procesar-pdf';

// Ejecutar la prueba
console.log('=== INICIANDO PRUEBA DE API DE PROCESAMIENTO DE PDF ===\n');
testPdfProcessing(PDF_PATH, API_URL)
  .then(() => console.log('\n=== PRUEBA FINALIZADA ==='))
  .catch(err => console.error('\n=== ERROR EN LA PRUEBA ===', err));