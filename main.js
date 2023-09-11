const ctx1 = document.getElementById('chart-canvas1');
const ctx2 = document.getElementById('chart-canvas2');


//DO amount of time spent on each retainer INSTEAD of free time reduce percent
//hours_spent_per_retainer: 4,

const settings = {
  max_retainer_count: 250,

  // How much of our free time each retainer takes up per month ( hours_spent_on_single_retainer / hours_in_a_month(720) )
  retainer_free_time_reduce: 0.6, // %

  // How often to hire another helper ( 10 would mean hire one every 10 retainers )
  // We can also do this based on freetime too
  retainer_hire_divisor: 10,

  // How many retainers the helper can cover for x amount of money
  helper_work_count: 15,

  // Money per retainer ( monthly )
  revenue_per_retainer: 200,

  // Money to give to each helper ( monthly )
  // Just keep it below (revenue_per_retainer * retainer_hire_divisor) and it should be in profit
  money_per_helper: 1250
}
console.log(settings.revenue_per_retainer * settings.retainer_hire_divisor);

// Set defaults
Object.keys(settings).forEach(key => {
  document.getElementById(key).value = settings[key];
})




const data = calc_data(settings);

function calc_data(settings) {
  // Holds data
  const data = [];

  for (let retainer_count = 0; retainer_count < settings.max_retainer_count; retainer_count++) {

    const num_of_helpers = (retainer_count / settings.retainer_hire_divisor) | 0;

    const revenue = Math.max((retainer_count * settings.revenue_per_retainer) - settings.money_per_helper * num_of_helpers, 0);

    const free_time = Math.min(100 * ((1 - settings.retainer_free_time_reduce / 100) ** (retainer_count - num_of_helpers * settings.helper_work_count)), 100);

    data.push({
      revenue: revenue,
      free_time: free_time,
      num_of_helpers: num_of_helpers
    })
  }

  return data;
}

const time_chart = new Chart(ctx2, {
  type: 'line',
  data: {
    labels: Array.from({ length: settings.max_retainer_count }, (_, idx) => `${++idx}`),
    datasets: [
      {
        label: '# of Helpers',
        type: 'bar',
        data: data.map(e => e.num_of_helpers),
        borderWidth: 3,
        pointRadius: 0
      },
      {
        label: '% Free Time',
        data: data.map(e => e.free_time),
        borderWidth: 3,
        pointRadius: 0
      },
    ]
  },
  options: {
    scales: {
      y: {
        beginAtZero: true,
      }
    }
  },
});

const financial_chart = new Chart(ctx1, {
  type: 'line',
  data: {
    labels: Array.from({ length: settings.max_retainer_count }, (_, idx) => `${++idx}`),
    datasets: [
      {
        label: 'Profit',
        data: data.map(e => e.revenue),
        borderColor: 'hsl(180, 48%, 52%)',
        borderWidth: 3,
        pointRadius: 0
      },
      {
        label: 'Total Revenue',
        data: data.map((e, i) => i * settings.revenue_per_retainer),
        borderColor: '#36a2eb',
        borderWidth: 3,
        pointRadius: 0
      },
      {
        label: 'Money spent on Helpers',
        data: data.map(e => e.num_of_helpers * settings.money_per_helper),
        borderColor: '#ff9f40',
        borderWidth: 3,
        pointRadius: 0
      }
    ]
  },
  options: {
    scales: {
      y: {
        beginAtZero: true,
      }
    }
  },
});


const inputs = document.querySelectorAll('input');

inputs.forEach(e => {
  e.addEventListener('change', () => {
    settings[e.id] = e.value;

    const data = calc_data(settings);
    financial_chart.data.labels = Array.from({ length: settings.max_retainer_count }, (_, idx) => `${++idx}`);
    time_chart.data.labels = Array.from({ length: settings.max_retainer_count }, (_, idx) => `${++idx}`);
    financial_chart.data.datasets[0].data = data.map(e => e.revenue);
    financial_chart.data.datasets[1].data = data.map((e, i) => i * settings.revenue_per_retainer);
    financial_chart.data.datasets[2].data = data.map(e => e.num_of_helpers * settings.money_per_helper);
    time_chart.data.datasets[0].data = data.map(e => e.num_of_helpers);
    time_chart.data.datasets[1].data = data.map(e => e.free_time);
    financial_chart.update();
    time_chart.update();
  })
});
