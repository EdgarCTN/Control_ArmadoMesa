// URL de la API (ajusta la ruta según donde se encuentre alojado tu api.php)
const apiUrl = "https://07d4156a-7ffe-48fa-a08b-84fab5048dad-00-xr9pxzhzg06z.janeway.replit.dev/";

// Función para controlar el LED mediante POST
function controlLed(status) {
  fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: status })
  })
  .then(response => response.json())
  .then(data => {
    document.getElementById("status").innerText = "Estado del LED: " + status;
    console.log("Respuesta:", data);
    fetchLedHistory(); // Actualiza el gráfico del historial del LED
  })
  .catch(error => {
    document.getElementById("status").innerText = "Error en la solicitud";
    console.error("Error:", error);
  });
}

// Función para obtener el historial de cambios del LED
function fetchLedHistory() {
  fetch(apiUrl + "?history=true")
    .then(response => response.json())
    .then(data => {
      const timestamps = data.map(entry => entry.timestamp);
      const statuses = data.map(entry => entry.status === 'ON' ? 1 : 0);

      const ctx = document.getElementById('ledHistoryChart').getContext('2d');
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: timestamps,
          datasets: [{
            label: 'Estado del LED (1=Encendido, 0=Apagado)',
            data: statuses,
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            fill: false,
            tension: 0.1
          }]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1,
                callback: function(value) { return value === 1 ? 'ON' : 'OFF'; }
              }
            }
          }
        }
      });
    })
    .catch(error => console.error("Error al obtener el historial:", error));
}
let sensorChart; // Variable global para la instancia del gráfico

function fetchSensorData() {
  fetch(apiUrl + "?sensor=true")
    .then(response => response.json())
    .then(data => {
      if (data.length > 0) {
        const ultimaLectura = data[data.length - 1];
        document.getElementById("sensorStatus").innerText =
          "Temperatura: " + ultimaLectura.temperatura + "°C, " +
          "Humedad: " + ultimaLectura.humedad + "%, " +
          "Timestamp: " + ultimaLectura.timestamp;
      } else {
        document.getElementById("sensorStatus").innerText = "No hay datos de sensor.";
      }

      // Actualizar gráfico de temperatura
      const timestamps = data.map(entry => entry.timestamp);
      const temperaturas = data.map(entry => entry.temperatura);
      
      const ctxSensor = document.getElementById('sensorChart').getContext('2d');
      
      // Destruir gráfico existente si existe
      if (sensorChart) {
        sensorChart.destroy();
      }
      
      // Crear una nueva instancia del gráfico
      sensorChart = new Chart(ctxSensor, {
        type: 'line',
        data: {
          labels: timestamps,
          datasets: [{
            label: 'Temperatura (°C)',
            data: temperaturas,
            borderColor: 'rgba(255, 99, 132, 1)',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            fill: false,
            tension: 0.1
          }]
        },
        options: {
          scales: {
            y: { beginAtZero: true }
          }
        }
      });
    })
    .catch(error => console.error("Error al obtener datos del sensor:", error));
}


// Inicializar llamadas cuando el documento se cargue
document.addEventListener('DOMContentLoaded', () => {
  fetchLedHistory();
  fetchSensorData();
  setInterval(fetchSensorData, 5000); // Actualiza datos de sensor cada 5 segundos
});
