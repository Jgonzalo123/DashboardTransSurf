// Set new default font family and font color to mimic Bootstrap's default styling
Chart.defaults.global.defaultFontFamily = '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
Chart.defaults.global.defaultFontColor = '#292b2c';

barIndicators();

async function barIndicators() {
  await fetch('http://localhost:8080/api/indicador/pie', {
      method: 'GET',
      headers: {
          'Authorization': 'Bearer ' + localStorage.token
      }
  }).then(res => res.json())
  .then(resp => {
      let items = resp.sort((a,b) => b[1]-a[1]);
      items = items.slice(0, 5);
      const labels = items.map(i => i[0]);
      const data = items.map(i => i[1]);

      cargarPieChart(labels, data);
  });
}

function cargarPieChart(labels, data) {
  // Pie Chart Example
  var ctx = document.getElementById("myPieChart");
  var myPieChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: ['#007bff', '#dc3545', '#ffc107', '#28a745', '#74aa55aa'],
      }],
    },
  });
}
