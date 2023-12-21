const net = require('net');
const fs = require('fs');

function connectToWeatherStation() {
  const client = net.createConnection({ host: '127.0.0.1', port: 54000 });

  client.on('connect', () => {
    console.log('Connected to Weather Station Service');

    
    fetchDataAndUpdate(client);
    setInterval(() => fetchDataAndUpdate(client), 5000); // get new data every 5 seconds instead of restart server everytime. 
  });

  client.on('data', (data) => {
    const responseData = data.toString();
    console.log('Received data:', responseData);

    try {
      const weatherData = JSON.parse(responseData);
      displayWeatherData(weatherData);
    } catch (error) {
      console.error('Error parsing JSON:', error.message);
    }
  });

  client.on('end', () => {
    console.log('Connection closed');
  });

  // client.on('error', (err) => {
  //   console.error('Error:', err.message);
  //   console.error(err.stack); 
  // }); no errors really come up. 
}

function fetchDataAndUpdate(client) {
  console.log('Sending READ request');
  client.write('READ');
}

function displayWeatherData(weatherData) { // do we need all this on console?
  console.log('Weather Station Data:');
  console.log(`Temperature = ${weatherData.temperature.toFixed(2)} °C`);
  console.log(`Humidity = ${weatherData.humidity.toFixed()} %`); 
  console.log(`Pressure = ${weatherData.pressure.toFixed()} mBar`);
  console.log(`Wind Speed = ${weatherData.windSpeed.toFixed(2)} km/h`);

  saveDataToJson(weatherData);
}

function saveDataToJson(weatherData, maxEntries = 10) {
    const filePath = 'weather_data.json';
  
    // Read existing data from the file
    let existingData = [];
    try {
      const dataString = fs.readFileSync(filePath, 'utf8');
      existingData = JSON.parse(dataString);
    } catch (error) {
      // File might not exist or might be empty
    }
  
    // Add the new weather data
    existingData.push(weatherData);
  
    // rewrites the file to only have the last 10 entries so is not too big of a file
    if (existingData.length > maxEntries) {
      existingData = existingData.slice(-maxEntries);
    }
  
    // Write the updated data back to the file
    fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2), 'utf8');

  }

connectToWeatherStation();

module.exports = {
  connectToWeatherStation,
  fetchDataAndUpdate,
  displayWeatherData,
  saveDataToJson,
};