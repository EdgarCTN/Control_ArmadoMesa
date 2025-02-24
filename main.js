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
  })
  .catch(error => {
    document.getElementById("status").innerText = "Error en la solicitud";
    console.error("Error:", error);
  });
}

let sensorChart; // Variable global para la instancia del gráfico de sensores

function fetchSensorData() {
  fetch(apiUrl + "?sensor=true")
    .then(response => response.json())
    .then(data => {
      if (data.length > 0) {
        const ultimaLectura = data[data.length - 1];
        document.getElementById("sensorStatus").innerText =
          "Sensor1: " + ultimaLectura.sensor1 + ", " +
          "Sensor2: " + ultimaLectura.sensor2 + ", " +
          "Sensor3: " + ultimaLectura.sensor3 + ", " +
          "Sensor4: " + ultimaLectura.sensor4 + ", " +
          "Sensor5: " + ultimaLectura.sensor5 + " (Timestamp: " + ultimaLectura.timestamp + ")";
      } else {
        document.getElementById("sensorStatus").innerText = "No hay datos de sensor.";
      }

      // Preparar datos para el gráfico con 5 líneas
      const timestamps = data.map(entry => entry.timestamp);
      const sensor1Data = data.map(entry => entry.sensor1);
      const sensor2Data = data.map(entry => entry.sensor2);
      const sensor3Data = data.map(entry => entry.sensor3);
      const sensor4Data = data.map(entry => entry.sensor4);
      const sensor5Data = data.map(entry => entry.sensor5);

      const ctxSensor = document.getElementById('sensorChart').getContext('2d');
      
      // Destruir gráfico existente si existe para evitar conflictos
      if (sensorChart) {
        sensorChart.destroy();
      }
      
      // Crear la nueva instancia del gráfico con múltiples datasets
      sensorChart = new Chart(ctxSensor, {
        type: 'line',
        data: {
          labels: timestamps,
          datasets: [
            {
              label: 'Sensor1',
              data: sensor1Data,
              borderColor: 'rgba(255, 99, 132, 1)',
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              fill: false,
              tension: 0.1
            },
            {
              label: 'Sensor2',
              data: sensor2Data,
              borderColor: 'rgba(54, 162, 235, 1)',
              backgroundColor: 'rgba(54, 162, 235, 0.2)',
              fill: false,
              tension: 0.1
            },
            {
              label: 'Sensor3',
              data: sensor3Data,
              borderColor: 'rgba(255, 206, 86, 1)',
              backgroundColor: 'rgba(255, 206, 86, 0.2)',
              fill: false,
              tension: 0.1
            },
            {
              label: 'Sensor4',
              data: sensor4Data,
              borderColor: 'rgba(75, 192, 192, 1)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              fill: false,
              tension: 0.1
            },
            {
              label: 'Sensor5',
              data: sensor5Data,
              borderColor: 'rgba(153, 102, 255, 1)',
              backgroundColor: 'rgba(153, 102, 255, 0.2)',
              fill: false,
              tension: 0.1
            }
          ]
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
  fetchSensorData();
  setInterval(fetchSensorData, 5000); // Actualiza datos de sensor cada 5 segundos
});
