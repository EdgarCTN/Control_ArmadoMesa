// URL de la API (ajusta la ruta según donde se encuentre alojado tu api.php)
const apiUrl = "https://07d4156a-7ffe-48fa-a08b-84fab5048dad-00-xr9pxzhzg06z.janeway.replit.dev/";

// Configuración de títulos y parámetros para cada sensor (solo se usan sensor1, sensor2 y sensor3)
const sensorTitles = {
  sensor1: {
    title: "Sensor de temperatura del modelo de armado de mesa",
    parameter: "Temperatura (°C)"
  },
  sensor2: {
    title: "Sensor de humedad del modelo de armado de mesa",
    parameter: "Humedad (%)"
  },
  sensor3: {
    title: "Sensor de distancia (HC-SR04) del modelo de armado de mesa",
    parameter: "Distancia (cm)"
  }
};

let currentChartMode = 'single'; // 'single' o 'all'
let sensorChart;                // Instancia del gráfico en modo único
let sensorCharts = {};          // Instancias de gráficos en modo "todos"
let sensorDataHistory = [];     // Historial de datos de sensores

// Opciones comunes para gráficos responsivos
const chartResponsiveOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    title: { display: true },
    subtitle: { display: true }
  },
  scales: {
    y: {
      beginAtZero: true,
      title: { display: true }
    }
  }
};

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

// Actualiza el sensor card con datos formateados (solo se muestran sensores 1, 2 y 3)
function updateSensorCard(ultimaLectura) {
  const sensorHTML = `
    <div class="sensor-row"><span class="sensor-label">${sensorTitles.sensor1.title}:</span> <span class="sensor-value">${ultimaLectura.sensor1}</span></div>
    <div class="sensor-row"><span class="sensor-label">${sensorTitles.sensor2.title}:</span> <span class="sensor-value">${ultimaLectura.sensor2}</span></div>
    <div class="sensor-row"><span class="sensor-label">${sensorTitles.sensor3.title}:</span> <span class="sensor-value">${ultimaLectura.sensor3}</span></div>
    <div class="sensor-timestamp"><em>Última actualización: ${ultimaLectura.timestamp}</em></div>
  `;
  document.getElementById("sensorStatus").innerHTML = sensorHTML;
}

// Actualizar gráfico en modo único (según el sensor seleccionado)
function updateSensorChart() {
  const sensorSelect = document.getElementById("sensorSelect");
  const sensorKey = sensorSelect.value; // "sensor1", "sensor2" o "sensor3"
  const config = sensorTitles[sensorKey];
  
  const timestamps = sensorDataHistory.map(entry => entry.timestamp);
  const sensorValues = sensorDataHistory.map(entry => entry[sensorKey]);
  
  if (sensorChart) {
    sensorChart.data.labels = timestamps;
    sensorChart.data.datasets[0].data = sensorValues;
    sensorChart.data.datasets[0].label = config.parameter;
    sensorChart.options.plugins.title.text = config.title;
    sensorChart.options.plugins.subtitle.text = config.parameter;
    sensorChart.options.scales.y.title.text = config.parameter;
    sensorChart.update();
  } else {
    const ctx = document.getElementById('sensorChart').getContext('2d');
    sensorChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: timestamps,
        datasets: [{
          label: config.parameter,
          data: sensorValues,
          borderColor: 'rgba(54, 162, 235, 1)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          fill: false,
          tension: 0.1
        }]
      },
      options: {
        ...chartResponsiveOptions,
        plugins: {
          ...chartResponsiveOptions.plugins,
          title: { display: true, text: config.title },
          subtitle: { display: true, text: config.parameter }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: config.parameter }
          }
        }
      }
    });
  }
}

// Actualizar gráficos en modo "todos" (solo se muestran gráficos para sensor1, sensor2 y sensor3)
function updateAllSensorCharts() {
  const sensorKeys = ['sensor1', 'sensor2', 'sensor3'];
  const timestamps = sensorDataHistory.map(entry => entry.timestamp);
  
  sensorKeys.forEach(sensorKey => {
    const config = sensorTitles[sensorKey];
    const sensorValues = sensorDataHistory.map(entry => entry[sensorKey]);
    const canvasId = "sensorChart_" + sensorKey;
    
    if (sensorCharts[sensorKey]) {
      sensorCharts[sensorKey].data.labels = timestamps;
      sensorCharts[sensorKey].data.datasets[0].data = sensorValues;
      sensorCharts[sensorKey].data.datasets[0].label = config.parameter;
      sensorCharts[sensorKey].options.plugins.title.text = config.title;
      sensorCharts[sensorKey].options.plugins.subtitle.text = config.parameter;
      sensorCharts[sensorKey].options.scales.y.title.text = config.parameter;
      sensorCharts[sensorKey].update();
    } else {
      const canvas = document.createElement("canvas");
      canvas.id = canvasId;
      // No se fija ancho/alto en atributos, el CSS se encarga de ello.
      document.getElementById("chartContainer").appendChild(canvas);
      const ctx = canvas.getContext('2d');
      sensorCharts[sensorKey] = new Chart(ctx, {
        type: 'line',
        data: {
          labels: timestamps,
          datasets: [{
            label: config.parameter,
            data: sensorValues,
            borderColor: getSensorColor(sensorKey),
            backgroundColor: getSensorColor(sensorKey, 0.2),
            fill: false,
            tension: 0.1
          }]
        },
        options: {
          ...chartResponsiveOptions,
          plugins: {
            ...chartResponsiveOptions.plugins,
            title: { display: true, text: config.title },
            subtitle: { display: true, text: config.parameter }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: { display: true, text: config.parameter }
            }
          }
        }
      });
    }
  });
}

// Función auxiliar para obtener colores según el sensor (solo se definen para sensor1, sensor2 y sensor3)
function getSensorColor(sensorKey, alpha = 1) {
  const colors = {
    sensor1: `rgba(255, 99, 132, ${alpha})`,
    sensor2: `rgba(54, 162, 235, ${alpha})`,
    sensor3: `rgba(255, 206, 86, ${alpha})`
  };
  return colors[sensorKey] || `rgba(100, 100, 100, ${alpha})`;
}

// Alternar entre modo "único" y "todos"
function toggleChartMode() {
  const toggleBtn = document.getElementById("toggleChartMode");
  const chartContainer = document.getElementById("chartContainer");
  const singleControls = document.getElementById("singleControls");
  
  if (currentChartMode === 'single') {
    currentChartMode = 'all';
    toggleBtn.textContent = "Ver gráfico seleccionado";
    chartContainer.innerHTML = "";
    sensorChart = null;
    sensorCharts = {};
    updateAllSensorCharts();
    singleControls.style.display = "none";
  } else {
    currentChartMode = 'single';
    toggleBtn.textContent = "Ver todos los gráficos";
    chartContainer.innerHTML = '<canvas id="sensorChart"></canvas>';
    sensorChart = null;
    sensorCharts = {};
    updateSensorChart();
    singleControls.style.display = "flex";
  }
}

// Obtener datos de sensores
function fetchSensorData() {
  fetch(apiUrl + "?sensor=true")
    .then(response => response.json())
    .then(data => {
      sensorDataHistory = data;
      if (data.length > 0) {
        const ultimaLectura = data[data.length - 1];
        updateSensorCard(ultimaLectura);
      } else {
        document.getElementById("sensorStatus").innerHTML = "<p class='loading'>No hay datos de sensor.</p>";
      }
      if (currentChartMode === 'single') {
        updateSensorChart();
      } else {
        updateAllSensorCharts();
      }
    })
    .catch(error => console.error("Error al obtener datos del sensor:", error));
}

// Inicializar cuando el documento se cargue
document.addEventListener('DOMContentLoaded', () => {
  fetchSensorData();
  setInterval(fetchSensorData, 5000); // Actualiza cada 5 segundos
});
