// Function to set max date for date inputs to restrict selection to the past 1 month
function setMaxDate() {
    const endDateInput = document.getElementById('endDate');
    const startDateInput = document.getElementById('startDate');

    // Get today's date
    const today = new Date();
    console.log("Today's date object:", today);

    // Set the max attribute to today
    const todayFormatted = today.toISOString().split('T')[0];
    endDateInput.max = todayFormatted;

    // Calculate the date 1 month ago
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(today.getMonth() - 1);

    const oneMonthAgoFormatted = oneMonthAgo.toISOString().split('T')[0];
    startDateInput.max = todayFormatted;
    startDateInput.min = oneMonthAgoFormatted;

    // Optionally set default values for startDate and endDate
    startDateInput.value = oneMonthAgoFormatted;
    endDateInput.value = todayFormatted;
}

// Call the function to set the date limits
setMaxDate();

// Define the initial URL to get data
const apiUrl = "http://api.coindesk.com/v1/bpi/historical/close.json";

// Variable to hold the chart instance
let lineChartInstance;

// Cache for storing the initial data
let cachedData = null;

// Function to display max and min values
function displayMaxMin(data) {
    const prices = Object.values(data);
    const maxPrice = Math.max(...prices);
    const minPrice = Math.min(...prices);

    document.getElementById('maxPrice').textContent = `Max Price: ${maxPrice}`;
    document.getElementById('minPrice').textContent = `Min Price: ${minPrice}`;
}

// Function to update the chart with new data
function updateChart() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const currency = document.getElementById('currency').value || 'USD';

    if (startDate && endDate) {
        if (new Date(startDate) > new Date(endDate)) {
            alert("End date must be after start date.");
            return;
        }

        if (cachedData && currency === 'USD') {
            console.log("Using cached data for USD");
            const filteredData = filterDataByDate(cachedData, startDate, endDate);
            const labels = Object.keys(filteredData);
            const data = Object.values(filteredData);
            updateLineChart(labels, data, currency);
            displayMaxMin(filteredData);
        } else {
            const fullUrl = `${apiUrl}?start=${startDate}&end=${endDate}&currency=${currency}`;

            console.log("Fetching new data from API");
            console.log("Constructed API URL:", fullUrl);

            axios.get(fullUrl)
                .then(response => {
                    console.log("API Response Data", response.data);

                    if (currency === 'USD') {
                        cachedData = response.data.bpi;
                    }

                    const labels = Object.keys(response.data.bpi);
                    const data = Object.values(response.data.bpi);

                    updateLineChart(labels, data, currency);
                    displayMaxMin(response.data.bpi);
                })
                .catch(error => {
                    console.error("Error fetching data", error);
                });
        }
    } else {
        console.log("Both start and end dates must be selected.");
    }
}

// Function to filter cached data by date range
function filterDataByDate(data, startDate, endDate) {
    const filteredData = {};
    for (let date in data) {
        if (date >= startDate && date <= endDate) {
            filteredData[date] = data[date];
        }
    }
    return filteredData;
}

// Function to update the line chart
function updateLineChart(labels, data, currency) {
    const ctx = document.getElementById('myChart').getContext('2d');

    // Destroy previous chart instance if exists
    if (lineChartInstance) {
        lineChartInstance.destroy();
    }

    // Create new chart instance
    lineChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: `Bitcoin Price Index (${currency})`,
                data: data,
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Date'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: `Price (${currency})`
                    }
                }
            }
        }
    });
}

// Event listeners to update the chart when the user changes the date or currency
document.getElementById('startDate').addEventListener('change', updateChart);
document.getElementById('endDate').addEventListener('change', updateChart);
document.getElementById('currency').addEventListener('change', updateChart);

// Call updateChart initially to load the default data
updateChart();
