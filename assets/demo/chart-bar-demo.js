// Set new default font family and font color to mimic Bootstrap's default styling
Chart.defaults.global.defaultFontFamily = '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
Chart.defaults.global.defaultFontColor = '#292b2c';

barIndicators1();
barIndicators2();

async function barIndicators1() {
  await fetch('http://localhost:8080/api/indicador/bar1', {
      method: 'GET',
      headers: {
          'Authorization': 'Bearer ' + localStorage.token
      }
  }).then(res => res.json())
  .then(resp => {
      const items = resp.sort((a,b) => b[1]-a[1]);
      const labels = items.map(i => i[0]);
      const data = items.map(i => i[1]);
      cargarBarChart1(labels, data);
  });
}

function cargarBarChart1(labels, data) {
  // Bar Chart Example
  var ctx = document.getElementById("myBarChart");
  var myLineChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: "Cantidad",
        backgroundColor: "rgba(2,117,216,1)",
        borderColor: "rgba(2,117,216,1)",
        data: data,
      }],
    },
    options: {
      scales: {
        xAxes: [{
          time: {
            unit: 'month'
          },
          gridLines: {
            display: false
          },
          ticks: {
            maxTicksLimit: 6
          }
        }],
        yAxes: [{
          ticks: {
            min: 0,
            max: Math.max(...data),
            maxTicksLimit: 5
          },
          gridLines: {
            display: true
          }
        }],
      },
      legend: {
        display: false
      }
    }
  });
}

async function barIndicators2() {
  await fetch('http://localhost:8080/api/indicador/bar2', {
      method: 'GET',
      headers: {
          'Authorization': 'Bearer ' + localStorage.token
      }
  }).then(res => res.json())
  .then(resp => {
      let items = resp.sort((a,b) => b[1]-a[1]);
      items = items.filter((i) => (i[0].roles[0].idRol == 4) || (i[0].roles[1].idRol == 4));
      console.log(items);
      const labels = items.map(i => (i[0].numDoc + " : " + i[0].nombre));
      const data = items.map(i => i[1]);
      cargarBarChart2(labels, data);
  });
}

function cargarBarChart2(labels, data) {
  var abc = document.getElementById("myBarChart1");
  var myLineChart = new Chart(abc, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: "Driver",
        backgroundColor: "rgba(2,117,216,1)",
        borderColor: "rgba(2,117,216,1)",
        data: data,
      }],
    },
    options: {
      scales: {
        xAxes: [{
          time: {
            unit: 'month'
          },
          gridLines: {
            display: false
          },
          ticks: {
            maxTicksLimit: 6
          }
        }],
        yAxes: [{
          ticks: {
            min: 0,
            max: Math.max(...data),
            maxTicksLimit: 5
          },
          gridLines: {
            display: true
          }
        }],
      },
      legend: {
        display: false
      }
    }
  });
}
