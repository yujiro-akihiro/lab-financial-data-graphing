// 
// set Url to get data
const apiUrl = "http://api.coindesk.com/v1/bpi/historical/close.json";

// using axios to get data
axios.get(apiUrl)
    .then(response => {
        console.log("API Response Data", response.data);

        // draw graph using "response.data"
        const labels = Object.keys(response.data.bpi); // array of data
        const data = Object.values(response.data.bpi); // array of value

        // creating graph
        const ctx = document.getElementById('myChart').getContext('2d');

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Bitcoin Price Index (USD)',
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
                            text: 'Price (USD)'
                        }
                    }
                }
            }
        });



    })
    .catch(error => {
        console.error("Error fetching data", error);
    });