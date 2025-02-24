// URL de la API (ajusta la ruta según donde se encuentre alojado tu api.php)
const apiUrl = "https://07d4156a-7ffe-48fa-a08b-84fab5048dad-00-xr9pxzhzg06z.janeway.replit.dev/";

let sensorChart;           // Instancia global del gráfico de sensor
let sensorDataHistory = []; // Almacenará el historial obtenido

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

// Función para actualizar la gráfica de sensor según el sensor seleccionado
function updateSensorChart() {
  const sensorSelect = document.getElementById("sensorSelect");
  const sensorKey = sensorSelect.value; // e.g., "sensor1", "sensor2", etc.
  
  // Extraer etiquetas (timestamps) y datos para el sensor seleccionado
  const timestamps = sensorDataHistory.map(entry => entry.timestamp);
  const sensorValues = sensorDataHistory.map(entry => entry[sensorKey]);

  // Si la gráfica ya existe, actualiza sus datos; de lo contrario, créala
  if (sensorChart) {
    sensorChart.data.labels = timestamps;
    sensorChart.data.datasets[0].data = sensorValues;
    sensorChart.data.datasets[0].label = sensorKey;
    sensorChart.update();
  } else {
    const ctxSensor = document.getElementById('sensorChart').getContext('2d');
    sensorChart = new Chart(ctxSensor, {
      type: 'line',
      data: {
        labels: timestamps,
        datasets: [{
          label: sensorKey,
          data: sensorValues,
          borderColor: 'rgba(54, 162, 235, 1)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
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
  }
}

// Función para obtener datos de sensores
function fetchSensorData() {
  fetch(apiUrl + "?sensor=true")
    .then(response => response.json())
    .then(data => {
      // Guardar el historial de datos obtenido
      sensorDataHistory = data;
      
      // Actualizar el párrafo con la última lectura (muestra todos los sensores)
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
      
      // Actualizar la gráfica del sensor seleccionado
      updateSensorChart();
    })
    .catch(error => console.error("Error al obtener datos del sensor:", error));
}

// Inicializar llamadas cuando el documento se cargue
document.addEventListener('DOMContentLoaded', () => {
  fetchSensorData();
  // Actualizar los datos sin reinicializar la gráfica
  setInterval(fetchSensorData, 5000); // Actualiza datos de sensor cada 5 segundos
});
