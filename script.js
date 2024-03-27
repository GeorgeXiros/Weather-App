class WeatherDataFetcher {
    constructor() {
        this.baseApiUrl = 'https://api.openweathermap.org/data/2.5';
        this.apiKey = '089ccd8bf0399922d7245e9bd450385d'; 
    }

    getLocation(query, callback) {
        $.getJSON(`${this.baseApiUrl}/weather`, { q: query, appid: this.apiKey })
            .done(data => callback(data))
            .fail(() => callback(null));
    }

    getWeatherData(location, callback) {
        $.getJSON(`${this.baseApiUrl}/weather`, { id: location.id, appid: this.apiKey })
            .done(data => callback(data))
            .fail(() => callback(null));
    }
}

class CoreDomElements {
    constructor() {
        this.searchForm = $('#search-form');
        this.errorBox = $('#error-box');
        this.searchBox = $('#search-box');
        this.loaderBox = $('#loader-box');
        this.forecastBox = $('#forecast-box');
    }

    showForecast() {
        this.hideError();
        this.forecastBox.removeClass('d-none');
        this.forecastBox.addClass('d-flex');
    }

    showLoader() {
        this.loaderBox.removeClass('d-none');
    }

    hideLoader() {
        this.loaderBox.addClass('d-none');
    }

    showSearch() {
        this.searchBox.removeClass('d-none');
        this.searchBox.addClass('d-flex');
    }

    hideSearchBox() {
        this.searchBox.removeClass('d-flex');
        this.searchBox.addClass('d-none');
    }

    showError(message) {
        this.hideLoader();
        this.showSearch();
        this.errorBox.removeClass('d-none');
        this.errorBox.addClass('d-block');
        this.errorBox.html(`<p class="mb-0">${message}</p>`);
    }

    hideError() {
        this.errorBox.addClass('d-none');
    }
}

class DisplayForecast {
    constructor() {
        this.imageURL = 'https://openweathermap.org/img/wn';
    }

    showTodaysForecastDetails({ name, value, unit }) {
        $(`#forecast-details`).append(`
            <div class="d-flex justify-content-between">
                <span class="font-weight-bolder">${name}</span>
                <span>${value} ${unit}</span>
            </div>
        `);
    }

    showUpcomingDaysForecast({ dayImgUrl, weekDay, maxTemp }) {
        $('#forecast-details-week').append(`
            <li class="forecastBox__week-day d-flex flex-column justify-content-center align-items-center p-2 weather-day">
                <img class="mb-2" width="30" src="${this.imageURL}/${dayImgUrl}@2x.png" />
                <span class="mb-2">${weekDay}</span>
                <span class="font-weight-bold">${maxTemp}&deg</span>
            </li>
        `);
    }

    showTodaysForecast(forecast) {
        $('#forecast-card-weekday').html(forecast.currentWeekday);
        $('#forecast-card-date').html(forecast.todaysFullDate);
        $('#forecast-card-location').html(forecast.locationName);
        $('#forecast-card-img').attr('src', `${this.imageURL}/${forecast.todaysImgUrl}@2x.png`);
        $('#forecast-card-temp').html(forecast.todaysTemp);
        $('#forecast-card-description').html(forecast.weatherState);
    }
}




class DataMiddleware {
    constructor() {
        this.displayForecast = new DisplayForecast();
        this.coreDomElements = new CoreDomElements();
    }

 gatherTodaysForecastDetails(data) {
    const kelvinToCelsius = kelvin => kelvin - 273.15; 

    return {
        predictability: {
            value: data.main.humidity,
            unit: '%',
        },
        humidity: {
            value: data.main.humidity,
            unit: '%',
        },
        wind: {
            value: data.wind.speed,
            unit: 'km/h',
        },
        'air pressure': {
            value: data.main.pressure,
            unit: 'mb',
        },
        'max temp': {
            value: kelvinToCelsius(data.main.temp_max).toFixed(2),
            unit: '°C',
        },
        'min temp': {
            value: kelvinToCelsius(data.main.temp_min).toFixed(2),
            unit: '°C',
        },
    };
}

    gatherTodaysForecastGeneral(data) {
        const kelvinToCelsius = kelvin => kelvin - 273.15; // Μετατροπή από Kelvin σε Celsius
        return {
            currentWeekday: moment().format('dddd'),
            todaysFullDate: moment().format('MMMM Do'),
            locationName: data.name,
            todaysImgUrl: data.weather[0].icon,
            todaysTemp: kelvinToCelsius(data.main.temp).toFixed(2),
            weatherState: data.weather[0].description,
        };
    }
    
    prepareDataForDom(data) {
        const todaysForecastGeneral = this.gatherTodaysForecastGeneral(data);
        const todaysForecastDetails = this.gatherTodaysForecastDetails(data);

        this.displayForecast.showTodaysForecast(todaysForecastGeneral);
        this.prepareTodaysForecastDetails(todaysForecastDetails);
        this.coreDomElements.hideLoader();
        this.coreDomElements.showForecast();
    }

    prepareTodaysForecastDetails(forecast) {
        $.each(forecast, (key, value) => {
            this.displayForecast.showTodaysForecastDetails({
                name: key.toUpperCase(),
                value: value.value,
                unit: value.unit,
            });
        });
    }
}

$(document).ready(function() {
    $('#reset-button').on('click', function() {

        $('#search-query').val('');

        $('#forecast-box').addClass('d-none');

        location.reload();

        $('.search-result-box').remove();
    });
});


function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showWeatherByLocation, handleLocationError);
    } else {
        console.error("Geolocation is not supported by this browser.");
    }
}

function showWeatherByLocation(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    searchWeather(latitude, longitude); 
}

function handleLocationError(error) {
    switch(error.code) {
        case error.PERMISSION_DENIED:
            console.error("User denied the request for Geolocation.");
            break;
        case error.POSITION_UNAVAILABLE:
            console.error("Location information is unavailable.");
            break;
        case error.TIMEOUT:
            console.error("The request to get user location timed out.");
            break;
        case error.UNKNOWN_ERROR:
            console.error("An unknown error occurred.");
            break;
    }
}
        
    function searchWeather(latitude, longitude) {
    const apiKey = '089ccd8bf0399922d7245e9bd450385d'; 
    const apiEndpoint = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}`;
    
    fetch(apiEndpoint)
        .then(response => response.json())
        .then(data => {
            console.log(data);
        })
        .catch(error => {
            console.error('Error fetching weather data:', error);
        });
}

document.getElementById("location-search-button").addEventListener("click", getLocation);

document.getElementById("location-search-button").addEventListener("click", getLocation);

document.addEventListener("DOMContentLoaded", function() {
    const cities = ["Athens", "Thessaloniki", "Heraklion", "Patra", "Larissa", "Volos", "Kalamata", "Rhodes"];
    const apiKey = '089ccd8bf0399922d7245e9bd450385d'; 

    cities.forEach(city => {
        fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`)
            .then(response => response.json())
            .then(data => {
                const temperature = Math.round(data.main.temp - 273.15); 
                const description = data.weather[0].description;
                const location = city;
                const forecastData = { temperature, description, location };
                addBoxForCity(forecastData);
            })
            .catch(error => {
                console.error(`Error fetching weather data for ${city}:`, error);
            });
    });
});

function show(){
    document.querySelector('.hamburger').classList.toggle('open')
    document.querySelector('.navigation').classList.toggle('active')
}

function addBoxForCity(data) {
    const container = document.createElement('div');
    container.className = 'city-box';
    const title = document.createElement('h3');
    title.textContent = data.location;

    const temperature = document.createElement('p');
    temperature.textContent = `${data.temperature}°C`;

    const description = document.createElement('p');
    description.textContent = data.description;

    container.appendChild(title);
    container.appendChild(temperature);
    container.appendChild(description);

    document.body.appendChild(container);
}

document.addEventListener('scroll', function() {
    const scrolled = window.scrollY;
    const parallax = document.querySelector('.parallax');
    const parallaxContent = document.querySelector('.parallax-content');
    parallax.style.backgroundPositionY = -scrolled * 0.3 + 'px';
    parallaxContent.style.transform = 'translateY(' + scrolled * 0.1 + 'px)';
});
let menu_icon_box = document.querySelector(".menu_icon_box");
let sidebar = document.querySelector(".sidebar");

menu_icon_box.onclick = function(){
    menu_icon_box.classList.toggle("active");
    sidebar.classList.toggle("active");
}

class RequestController {
    constructor() {
        this.weatherDataFetcher = new WeatherDataFetcher();
        this.coreDomElements = new CoreDomElements();
        this.dataMiddleware = new DataMiddleware();
        this.registerEventListener();
    }

    showRequestInProgress() {
        this.coreDomElements.showLoader();
        this.coreDomElements.hideSearchBox();
    }

    getQuery() {
        return $('#search-query').val().trim();
    }

    fetchWeather(query) {
        this.weatherDataFetcher.getLocation(query, location => {
            console.log("Location:", location); // Προσθήκη αυτής της γραμμής για ελέγχους
    
            if (!location || location.length === 0) {
                this.coreDomElements.showError('Could not find this location, please try again.');
                return;
            }
    
            console.log("Location:", location); 
    
            this.weatherDataFetcher.getWeatherData(location, data => { 
                console.log("Weather Data:", data); 
    
                if (!data) {
                    this.coreDomElements.showError('Could not proceed with the request, please try again later.');
                    return;
                }
    
                this.dataMiddleware.prepareDataForDom(data);
            });
        });
    }
    

    onSubmit() {
        const query = this.getQuery();
        if (!query) return;

        this.showRequestInProgress();
        this.fetchWeather(query);
    }

    registerEventListener() {
        this.coreDomElements.searchForm.on('submit', e => {
            e.preventDefault();
            this.onSubmit();
        });
    }
}

const request = new RequestController();