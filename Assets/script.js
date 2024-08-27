const cityForm = document.getElementById('cityForm');
const cityInput = document.getElementById('cityInput');
const forecast = document.getElementById('forecast');
const searchHistory = document.getElementById('searchHistory');

// Load search history from local storage when the page loads
window.addEventListener('load', () => {
    const history = JSON.parse(localStorage.getItem('searchHistory')) || [];
    displaySearchHistory(history);
});

cityForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const city = cityInput.value.trim();
    getWeatherData(city);
    cityInput.value = '';
});

function getWeatherData(city) {
    // Fetch weather data from OpenWeatherMap API
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=33300f31143c847a56901f7054bcb524&units=imperial`;
    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            displayCurrentWeather(data);
            // Fetch forecast data after fetching current weather data
            getForecastData(data.coord.lat, data.coord.lon);
            // Add city to search history and update local storage
            addToSearchHistory(city);
        })
        .catch(error => {
            console.error('There was a problem with your fetch operation:', error);
        });
}

// Function to display current weather conditions
function displayCurrentWeather(data) {
    // Update weatherInfo element with current weather data
    const cityName = data.name;
    const date = new Date(data.dt * 1000);
    const iconCode = data.weather[0].icon;
    const tempMax = data.main.temp_max;
    const tempMin = data.main.temp_min;
    const temp = data.main.temp;
    const humidity = data.main.humidity;
    const windSpeed = data.wind.speed;
    const weatherInfo = document.getElementById('weatherInfo');

    const html = `
        <h2>${cityName}</h2>
        <p>Date: ${date.toLocaleDateString()}</p>
        <img src="https://openweathermap.org/img/wn/${iconCode}.png" alt="Weather icon">
        <p>Current: ${temp} °F</p>
        <p>High: ${tempMax} °F</p>
        <p>Low: ${tempMin} °F</p>
        <p>Humidity: ${humidity}%</p>
        <p>Wind Speed: ${windSpeed} MPH</p>
    `;
    weatherInfo.innerHTML = html;
}

// Function to fetch forecast data
function getForecastData(lat, lon) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=33300f31143c847a56901f7054bcb524&units=imperial`;

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            displayForecast(data);
        })
        .catch(error => {
            console.error('There was a problem with your fetch operation:', error);
        });
}

// Function to display 5-day forecast
function displayForecast(data) {
    const forecastList = data.list;

    let html = '';

    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set hours to 0 to compare only dates

    // Keep track of unique forecast dates
    const uniqueDates = new Set();

    // Iterate over the forecast list
    for (const forecast of forecastList) {
        const date = new Date(forecast.dt * 1000);

        // Check if the forecast date is within the next 5 days and is unique
        if (date >= today && !uniqueDates.has(date.toDateString())) {
            const iconCode = forecast.weather[0].icon;
            const tempMax = forecast.main.temp_max;
            const tempMin = forecast.main.temp_min;
            const humidity = forecast.main.humidity;
            const windSpeed = forecast.wind.speed;
            const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getDay()];
            const formattedDate = `${date.getMonth() + 1}/${date.getDate()}`;

            html += `
                <div class="forecast-card">
                    <p>${dayOfWeek} (${formattedDate})</p>
                    <img src="https://openweathermap.org/img/wn/${iconCode}.png" alt="Weather icon">
                    <p>High: ${tempMax} °F</p>
                    <p>Low: ${tempMin} °F</p>
                    <p>Humidity: ${humidity}%</p>
                    <p>Wind Speed: ${windSpeed} MPH</p>
                </div>
            `;

            // Add the date to the set of unique dates
            uniqueDates.add(date.toDateString());

            // If we have added forecast cards for 5 days, break out of the loop
            if (uniqueDates.size >= 5) {
                break;
            }
        }
    }

    forecast.innerHTML = html;
}

// Function to add a new search entry to the search history and update local storage
function addToSearchHistory(city) {
    let history = JSON.parse(localStorage.getItem('searchHistory')) || [];
    // Check if city already exists in search history
    if (!history.includes(city)) {
        history.push(city);
        // Update local storage
        localStorage.setItem('searchHistory', JSON.stringify(history));
        // Update the search history display
        displaySearchHistory(history);
    }
}

// Function to display search history
// Function to display search history
function displaySearchHistory(history) {
    const dropdownMenu = document.getElementById('searchHistoryItems');
    
    // Clear previous dropdown items
    dropdownMenu.innerHTML = '';

    history.forEach(item => {
        const dropdownItem = document.createElement('button');
        dropdownItem.textContent = item;
        dropdownItem.classList.add('dropdown-item');
        dropdownItem.addEventListener('click', () => searchFromHistory(item));
        dropdownMenu.appendChild(dropdownItem);
    });
}

// Function to toggle dropdown menu visibility
document.getElementById('searchHistoryDropdownButton').addEventListener('click', function() {
    const dropdownMenu = document.getElementById('searchHistoryItems');
    dropdownMenu.classList.toggle('show');
});

// Close the dropdown if the user clicks outside of it
window.addEventListener('click', function(event) {
    if (!event.target.matches('#searchHistoryDropdownButton')) {
        const dropdowns = document.getElementsByClassName('dropdown-menu');
        for (let i = 0; i < dropdowns.length; i++) {
            const openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
});


// Function to perform a new search from the search history
function searchFromHistory(city) {
    getWeatherData(city);
}
