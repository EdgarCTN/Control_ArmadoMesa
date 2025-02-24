// URL de la API (ajusta la ruta según donde se encuentre alojado tu api.php)
const apiUrl = "https://07d4156a-7ffe-48fa-a08b-84fab5048dad-00-xr9pxzhzg06z.janeway.replit.dev/";

let currentChartMode = 'single'; // 'single' o 'all'
let sensorChart;                // Instancia del gráfico en modo único
let sensorCharts = {};          // Instancias de gráficos en modo "todos"
let sensorDataHistory = [];     // Historial de datos de sensores

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

// Actualizar gráfico en modo único (según el sensor seleccionado)
function updateSensorChart() {
  const sensorSelect = document.getElementById("sensorSelect");
  const sensorKey = sensorSelect.value; // "sensor1", "sensor2", etc.
  
  const timestamps = sensorDataHistory.map(entry => entry.timestamp);
  const sensorValues = sensorDataHistory.map(entry => entry[sensorKey]);
  
  if (sensorChart) {
    sensorChart.data.labels = timestamps;
    sensorChart.data.datasets[0].data = sensorValues;
    sensorChart.data.datasets[0].label = sensorKey;
    sensorChart.update();
  } else {
    const ctx = document.getElementById('sensorChart').getContext('2d');
    sensorChart = new Chart(ctx, {
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

// Actualizar gráficos en modo "todos"
function updateAllSensorCharts() {
  const sensorKeys = ['sensor1', 'sensor2', 'sensor3', 'sensor4', 'sensor5'];
  const timestamps = sensorDataHistory.map(entry => entry.timestamp);
  
  sensorKeys.forEach(sensorKey => {
    const sensorValues = sensorDataHistory.map(entry => entry[sensorKey]);
    const canvasId = "sensorChart_" + sensorKey;
    
    // Si ya existe el gráfico, actualizar sus datos
    if (sensorCharts[sensorKey]) {
      sensorCharts[sensorKey].data.labels = timestamps;
      sensorCharts[sensorKey].data.datasets[0].data = sensorValues;
      sensorCharts[sensorKey].update();
    } else {
      // Crear un nuevo canvas para este sensor si no existe
      const canvas = document.createElement("canvas");
      canvas.id = canvasId;
      canvas.width = 300;
      canvas.height = 150;
      document.getElementById("chartContainer").appendChild(canvas);
      const ctx = canvas.getContext('2d');
      sensorCharts[sensorKey] = new Chart(ctx, {
        type: 'line',
        data: {
          labels: timestamps,
          datasets: [{
            label: sensorKey,
            data: sensorValues,
            borderColor: getSensorColor(sensorKey),
            backgroundColor: getSensorColor(sensorKey, 0.2),
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
  });
}

// Función auxiliar para obtener colores según el sensor
function getSensorColor(sensorKey, alpha = 1) {
  const colors = {
    sensor1: `rgba(255, 99, 132, ${alpha})`,
    sensor2: `rgba(54, 162, 235, ${alpha})`,
    sensor3: `rgba(255, 206, 86, ${alpha})`,
    sensor4: `rgba(75, 192, 192, ${alpha})`,
    sensor5: `rgba(153, 102, 255, ${alpha})`
  };
  return colors[sensorKey] || `rgba(100, 100, 100, ${alpha})`;
}

// Función para alternar entre modo "único" y "todos"
function toggleChartMode() {
  const toggleBtn = document.getElementById("toggleChartMode");
  const chartContainer = document.getElementById("chartContainer");
  const singleControls = document.getElementById("singleControls");
  
  if (currentChartMode === 'single') {
    // Cambiar a modo "todos"
    currentChartMode = 'all';
    toggleBtn.textContent = "Ver gráfico seleccionado";
    // Limpiar container y crear contenedor para gráficos de todos los sensores
    chartContainer.innerHTML = "";
    sensorChart = null; // Descartar el gráfico único
    sensorCharts = {};  // Reiniciar gráficos múltiples
    updateAllSensorCharts();
    // Ocultar controles de selección de sensor
    singleControls.style.display = "none";
  } else {
    // Cambiar a modo "único"
    currentChartMode = 'single';
    toggleBtn.textContent = "Ver todos los gráficos";
    // Limpiar container y crear un canvas único
    chartContainer.innerHTML = '<canvas id="sensorChart" width="300" height="150"></canvas>';
    sensorChart = null;
    sensorCharts = {};
    updateSensorChart();
    // Mostrar controles de selección
    singleControls.style.display = "inline-block";
  }
}

// Función para obtener datos de sensores
function fetchSensorData() {
  fetch(apiUrl + "?sensor=true")
    .then(response => response.json())
    .then(data => {
      sensorDataHistory = data;
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
      // Actualizar gráfico según el modo actual
      if (currentChartMode === 'single') {
        updateSensorChart();
      } else {
        updateAllSensorCharts();
      }
    })
    .catch(error => console.error("Error al obtener datos del sensor:", error));
}

// Inicializar llamadas cuando el documento se cargue
document.addEventListener('DOMContentLoaded', () => {
  fetchSensorData();
  setInterval(fetchSensorData, 5000); // Actualiza datos de sensor cada 5 segundos
});
