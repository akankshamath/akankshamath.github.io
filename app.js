'use strict';

let userLat = 0;
let userLng = 0;
let city = '';
let uvIndex = '';

const apiKeyUV = 'openuv-1fxxhrm0eaw5gk-io';
const apiKeyMaps = 'AIzaSyBztL1lfT2UQW-S1w9_IXfUic_0mLkRTwc';
const apiWeather = '432e172a4f6d4beeb25e7698e6c85add';

const baseUrlUV = 'https://api.openuv.io/api/v1/uv';
const baseUrlProt = 'https://api.openuv.io/api/v1/protection';
const baseUrlFC = 'https://api.openuv.io/api/v1/forecast';

const baseUrlLoc = 'https://maps.googleapis.com/maps/api/geocode/json?';
const baseUrlWeather = 'https://api.weatherbit.io/v2.0/current?';

let today = new Date();
let tomorrow = new Date(today.setDate(today.getDate() + 1));

function buildStartPage() {
    $('main').empty();
    $('main').append(`
        <div class="startPage">
            <img id="startImage1" class="sun-image sun1" src="sun.png" alt="sun"> 
            <img id="startImage2" class="sun-image sun2" src="suncopy.png" alt="sun">
            <div class="startPage">
                <h1>UV Index Reporter</h1>
                <h3 class="startH2">Prepare for sunny weather</h3>
                <form id="js-form">
                    <label for="location">Enter your location:</label>
                    <input type="text" name="locationInput" id="js-location-input" placeholder="e.g. Singapore" required>
                    <input class="uvButton" type="submit" value="Get UV Index!">
                </form>
            </div>
            <div class="errorMessage">   
                <p id="js-error-message" class="error-message"></p>
            </div>
        </div> `);
}

function startApp() {
    buildStartPage();
}

function protectionLink() {
    $('#protectionTimeLink').click(function(event) {
      $('main').empty();
      getUVProtection(userLat, userLng);
    });
  }

function forecastLink() {
    $('#uvForecastLink').click(function(event) {
        $('main').empty();
        getUVForecast(userLat, userLng);
    });
}

function uvPage() {
    $('#currentUVI').click(function(event) {
        $('main').empty();
        getUVIndex(userLat, userLng);
    });
}

function uvRestart(){
    $('#restartButton').click(function(event){
        $('main').empty();
        buildStartPage();
        watchForm();
    });
}

function weatherLink(){
    $('#weatherLink').click(function(event){
        $('main').empty();
        getWeather(userLat, userLng);
    });
}

function toggleHamburger(){
    $('.hamburger').click(function(event){
        let menu = document.getElementById('navList');
        if (menu.style.display === 'flex') {
            menu.style.display = 'none';
        } else {
            menu.style.display = 'flex';
        }
    })
}

function buildNav(){
    $('header').append(
        `<nav role="navigation" id="nav">
            <button id="hamburger" class="hamburger hamburger-cancel">
                <span class="icon"></span>
            </button>
            <ul id="navList">
                <li id="currentUVI"><a href="#results-UV"><img class="linkImage" src="sunNav.png" alt="sun">UV Index</a></li>
                <li id="uvForecastLink"><a href="#forecastPage"><img class="linkImage" src="sunNav.png" alt="sun">UV Forecast</a></li>
                <li id="protectionTimeLink"><a href="#protectionPage"><img class="linkImage" src="sunNav.png" alt="sun">Protection Time</a></li>
                <li id="weatherLink"><a href="#weatherPage"><img class="linkImage" src="sunNav.png" alt="sun">Weather</a></li>
            </ul>
        </nav>`);
         uvPage();
         protectionLink();
         forecastLink();
         weatherLink();
         toggleHamburger();
}

function getLngLat(userInput) {
    const searchUrlLoc = baseUrlLoc + 'key=' + apiKeyMaps + '&address=' + userInput + '&sensor=false';
    
    fetch(searchUrlLoc)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error(response.statusText);
        })
        .then(responseJson => {
            if (responseJson.results && responseJson.results.length > 0) {
                userLat = `${responseJson.results[0].geometry.location.lat}`;
                userLng = `${responseJson.results[0].geometry.location.lng}`;
                city = `${responseJson.results[0].formatted_address}`;
                getUVIndex(userLat, userLng);
            } else {
                throw new Error('Location not found');
            }
        })
        .catch(err => {
            $('#js-error-message').text(`Something went wrong: ${err.message}`);
        });
}

function getUVIndex(latitude, longitude) {
    const urlUV = baseUrlUV + '?lat=' + latitude + '&lng=' + longitude;

    const options = {
        headers: new Headers({
            'x-access-token': apiKeyUV})
    };

    fetch(urlUV, options)
        .then(response => {
            if(response.ok) {
                return response.json();
            }
            throw new Error(response.statusText);
        })
        .then(responseJson => displayResultsUV(responseJson))
        .catch(err => {
            $('#js-error-message').text(`Something went wrong: ${err.message}`);
        });
}

function protectionButtonHandler() {
    $('#protectionButton').click(function(event) {
        getUVProtection(userLat, userLng);
    });
}
 
function forecastButtonHandler() {
    $('#forecastButton').click(function(event) {
        getUVForecast(userLat, userLng);
    });
}
 
function weatherButtonHandler() {
    $('#weatherButton').click(function(event) {
        getWeather(userLat, userLng);
    });
}

function displayResultsUV(responseJson) {
    uvIndex = `${responseJson.result.uv}`;
    let exposureTime = `<h4 class="exposureTimeH">Safe Exposure Time</h4>
    <ul id="results-list">
        <li class="SkinType"><img src="pale.png" alt="skin type 1" class="skinImage"> Skin Type 1: <span>${responseJson.result.safe_exposure_time.st1} min</span></li>
        <li class="SkinType"><img src="fair.png" alt="skin type 2" class="skinImage"> Skin Type 2: <span>${responseJson.result.safe_exposure_time.st2} min</span></li>
        <li class="SkinType"><img src="medium.png" alt="skin type 3" class="skinImage"> Skin Type 3: <span>${responseJson.result.safe_exposure_time.st3} min</span></li>
        <li class="SkinType"><img src="olive.png" alt="skin type 4" class="skinImage"> Skin Type 4: <span>${responseJson.result.safe_exposure_time.st4} min</span></li>
        <li class="SkinType"><img src="brown.png" alt="skin type 5" class="skinImage"> Skin Type 5: <span>${responseJson.result.safe_exposure_time.st5} min</span></li>
        <li class="SkinType"><img src="black.png" alt="skin type 6" class="skinImage"> Skin Type 6: <span>${responseJson.result.safe_exposure_time.st6} min</span></li>
    </ul>
    <input id="protectionButton" class="button" type="submit" value="Find the best time outside">
    <input id="weatherButton" class="button" type="submit" value="What's the weather">
    <input id="restartButton" class="button" type="submit" value="Change City">
</section>`;
$('main').empty();

if (uvIndex >= 11) {
    $('main').append(`
        <section id="results-UV" class="uvResult">
            <h2>The UV Index in <span>${city}</span></h2>
            <div class="uv-container">
                <div class="uv-sidebar">
                    <div class="uv-bar extreme">Extreme</div>
                    <div class="uv-bar very-high">Very High</div>
                    <div class="uv-bar high">High</div>
                    <div class="uv-bar moderate">Moderate</div>
                    <div class="uv-bar low">Low</div>
                </div>
                <div class="uv-image-container">
                    <img src="violet.png" alt="Violet UV Image" class="uv-image">
                    <div class="uv-index-text">The current UV index is</div>
                    <p class="uv-index-value">${uvIndex}</p>
                </div>
            </div>
            <h3 class="resultsDesc">VIOLET. It's bad. You WILL burn</h3>
            ${exposureTime}`);
} else if (uvIndex >= 8) {
    $('main').append(`
        <section id="results-UV" class="uvResult">
            <h2>The UV Index in <span>${city}</span></h2>
            <div class="uv-container">
                <div class="uv-sidebar">
                    <div class="uv-bar extreme">Extreme</div>
                    <div class="uv-bar very-high">Very High</div>
                    <div class="uv-bar high">High</div>
                    <div class="uv-bar moderate">Moderate</div>
                    <div class="uv-bar low">Low</div>
                </div>
                <div class="uv-image-container">
                    <img src="red.png" alt="Red UV Image" class="uv-image">
                    <div class="uv-index-text">The current UV index is</div>
                    <p class="uv-index-value">${uvIndex}</p>
                </div>
            <h3 class="resultsDesc">RED. Better safe than sorry. Stay in!</h3>
            </div>
            ${exposureTime}`);
} else if (uvIndex >= 6) {
    $('main').append(`
        <section id="results-UV" class="uvResult">
            <h2>The UV Index in <span>${city}</span></h2>
            <div class="uv-container">
                <div class="uv-sidebar">
                    <div class="uv-bar extreme">Extreme</div>
                    <div class="uv-bar very-high">Very High</div>
                    <div class="uv-bar high">High</div>
                    <div class="uv-bar moderate">Moderate</div>
                    <div class="uv-bar low">Low</div>
                </div>
                <div class="uv-image-container">
                    <img src="orange.png" alt="Orange UV Image" class="uv-image">
                    <div class="uv-index-text">The current UV index is</div>
                    <p class="uv-index-value">${uvIndex}</p>
                </div>
            </div>
            <h3 class="resultsDesc">ORANGE. Put on your sunscreen and have fun outside</h3>
            ${exposureTime}`);
} else if (uvIndex >= 3) {
    $('main').append(`
        <section id="results-UV" class="uvResult">
            <h2>The UV Index in <span>${city}</span></h2>
            <div class="uv-container">
                <div class="uv-sidebar">
                    <div class="uv-bar extreme">Extreme</div>
                    <div class="uv-bar very-high">Very High</div>
                    <div class="uv-bar high">High</div>
                    <div class="uv-bar moderate">Moderate</div>
                    <div class="uv-bar low">Low</div>
                </div>
                <div class="uv-image-container">
                    <img src="yellow.png" alt="Yellow UV Image" class="uv-image">
                    <div class="uv-index-text">The current UV index is</div>
                    <p class="uv-index-value">${uvIndex}</p>
                </div>
            </div>
            <h3 class="resultsDesc">YELLOW. Caution advised.</h3>
            ${exposureTime}`);
} else {
    $('main').append(`
        <section id="results-UV" class="uvResult">
            <h2>The UV Index in <span>${city}</span></h2>
            <div class="uv-container">
                <div class="uv-sidebar">
                    <div class="uv-bar extreme">Extreme</div>
                    <div class="uv-bar very-high">Very High</div>
                    <div class="uv-bar high">High</div>
                    <div class="uv-bar moderate">Moderate</div>
                    <div class="uv-bar low">Low</div>
                </div>
                <div class="uv-image-container">
                    <img src="green.png" alt="Green UV Image" class="uv-image">
                    <div class="uv-index-text">The current UV index is</div>
                    <p class="uv-index-value">${uvIndex}</p>
                </div>
            </div>
            <h3 class="resultsDesc">GREEN. You're safe. Enjoy the outdoors!</h3>
            ${exposureTime}`);
}


    weatherButtonHandler();
    protectionButtonHandler();
    uvRestart();

    let menu = document.getElementById('navList');
    if (menu.style.display === 'flex') {
        menu.style.display = 'none';
    }
}

function getUVProtection(latitude, longitude) {
    const urlProt = baseUrlProt + '?lat=' + latitude + '&lng=' + longitude;

    const options = {
        headers: new Headers({
            'x-access-token': apiKeyUV
        })
    };

    fetch(urlProt, options)
        .then(response => {
            if(response.ok) {
                return response.json();
            }
            throw new Error(response.statusText);
        })
        .then(responseJson => displayResultsProt(responseJson))
        .catch(err => {
            $('#js-error-message').text(`Something went wrong: ${err.message}`);
        });
}

function displayResultsProt(responseJson){
    let startRaw = `${responseJson.result.from_time}`;
    let endRaw = `${responseJson.result.to_time}`;
    let startTime = new Date(startRaw);
    let endTime = new Date(endRaw);
    let startHours = startTime.getHours();
    let startMin = startTime.getMinutes().toString().padStart(2, '0');
    let endHours = endTime.getHours();
    let endMin = endTime.getMinutes().toString().replace(/^(\d)$/, '0$1');

    $('main').empty().append(`<div id="currentUV">Current UV index in ${city}: ${uvIndex}</div>
    <div id="protectionPage">
        <img id="protectionImage" class="mainPic" src="icecream.png" alt="sunglasses">
        <h3 id="protectionHeadline">Protection Time in <span>${city}</span></h3>
        <p class="results-protection">
            From <span>${startHours}:${startMin}</span> to <span>${endHours}:${endMin}</span> the UV Index is high.
            Use sunscreen or go out after ${endHours}:${endMin}.
        </p>
        <input id="forecastButton" class="button" type="submit" value="Get tomorrow's UV index">
        <input id="weatherButton" class="button" type="submit" value="What's the weather">
        <input id="restartButton" class="button" type="submit" value="Change City">
    </div>`);
    forecastButtonHandler();
    weatherButtonHandler();
    uvRestart();
    let menu = document.getElementById('navList');
    if (menu.style.display === 'flex') {
        menu.style.display = 'none';
    }
}

function getUVForecast(latitude, longitude) {
    const urlFC = baseUrlFC + '?lat=' + latitude + '&lng=' + longitude + '&dt=' + tomorrow;

    const options = {
        headers: new Headers({
            'x-access-token': apiKeyUV
        })
    };

    fetch(urlFC, options)
        .then(response => {
            if(response.ok) {
                return response.json();
            }
            throw new Error(response.statusText);
        })
        .then(responseJson => convertResultsFC(responseJson))
        .catch(err => {
            $('#js-error-message').text(`Something went wrong: ${err.message}`);
        });
}

function convertResultsFC(responseJson) {
    let resultsLi = [];
    for(let i=0; i<responseJson.result.length; i++) {
        resultsLi += `<li><span class="${responseJson.result[i].uv >3.5 ? 'uvFC red' : 'uvFC'}">${responseJson.result[i].uv}</span> UV Index at ` + new Date(`${responseJson.result[i].uv_time}`).getHours() + ":" 
    + new Date(`${responseJson.result[i].uv_time}`).getMinutes().toString().replace(/^(\d)$/, '0$1')
    + `</li>`;
  }
    displayResultsFC(resultsLi);
}

function displayResultsFC(result) {
    $('main').empty().append(`<div id="currentUV"> ${city}: Tomorrow's UV Index</div>
    <div id="forecastPage">
        <img id="forecastImage" class="mainPic" src="beach.png" alt="umbrella">
        <h2 id="forecastHeadline">Your UV Forecast for tomorrow in <span>${city}</span></h2>
        <ul id="forecastList">
            ${result}
        </ul>
        <input id="weatherButton" class="button" type="submit" value="What's the weather">
        <input id="restartButton" class="button" type="submit" value="Change City">
    </div>`);
    weatherButtonHandler();
    uvRestart();
    let menu = document.getElementById('navList');
    if (menu.style.display === 'flex') {
        menu.style.display = 'none';
    }
}

function getWeather(latitude, longitude) {
    const urlWeather = baseUrlWeather +'&lat='+ latitude + '&lon=' + longitude + '&key=' + apiWeather;

    fetch(urlWeather)
        .then(response => {
            if(response.ok) {
                return response.json();
            }
            throw new Error(response.statusText);
        })
        .then(responseJson => displayWeather(responseJson))
        .catch(err => {
            $('#js-error-message').text(`Something went wrong: ${err.message}`);
        });
}

function displayWeather(responseJson) {
    let daytime = responseJson.data[0].pod;
    let weather = responseJson.data[0].weather.description;
    let temperature = responseJson.data[0].temp;
    let wind = responseJson.data[0].wind_spd;
    let humidity = responseJson.data[0].rh;
    let cloudCoverage = responseJson.data[0].clouds;

    let temperatureDisplay = `
    <div class=weatherContainer>
    <ul class="weatherList">
        <li class="weatherLi"><img class="weatherIcon" src="humidity.png" alt="humidity">Humidity: ${humidity} %</li>
        <li class="weatherLi"><img class="weatherIcon" src="windcloud.png" alt="wind">Wind: ${wind} m/s</li>
        <li class="weatherLi"><img class="weatherIcon" src="cloud.png" alt="clouds">Clouds: ${cloudCoverage} %</li>
    </ul>
    </div>

    <div class="temperature">
    <span id="temp" class="results-value">${temperature}°C</span></div>
    
    <div class="buttonContainer">
        <input id="restartButton" class="button" type="submit" value="Change City">
    </div>`;

    $('main').empty();

    if(daytime === "n") {
        $('main').append(`
            <div id="weatherPage">
            <h2 class="resultsWeather" id="weather1">
                The Weather in <span>${city}</span>
                <p class="results-value">${weather}</p>
            </h2>
            <img id="weatherImage" class="mainPic" src="moon.png" alt="moon">
            <div class="temperatureDisplay">
                ${temperatureDisplay}
        </div>
    </div>
`);

    } else if(temperature > 30 && cloudCoverage < 50) {
        $('main').append(`
        <div id="weatherPage">
        <h2 class="resultsWeather" id="weather1">
            The Weather in <span>${city}</span>
            <p class="results-value">${weather}</p>
        </h2>
        <img id="weatherImage" class="mainPic" src="sun2.png" alt="sun">
        <div class="temperatureDisplay">
            ${temperatureDisplay}
    </div>
</div>
`);

    } else if(temperature < 30 && cloudCoverage < 50) {
        $('main').append(`
        <div id="weatherPage">
        <h2 class="resultsWeather" id="weather1">
            The Weather in <span>${city}</span>
            <p class="results-value">${weather}</p>
        </h2>
        <img id="weatherImage" class="mainPic" src="blacksun.png" alt="sun">
        <div class="temperatureDisplay">
            ${temperatureDisplay}
    </div>
</div>
`);

    } else if(temperature < 0) {
        $('main').append(`
        <div id="weatherPage">
        <h2 class="resultsWeather" id="weather1">
            The Weather in <span>${city}</span>
            <p class="results-value">${weather}</p>
        </h2>
        <img id="weatherImage" class="mainPic" src="snowflake.png" alt="snow">
        <div class="temperatureDisplay">
            ${temperatureDisplay}
    </div>
</div>
`);

    } else if(cloudCoverage > 80) {
        $('main').append(`
        <div id="weatherPage">
        <h2 class="resultsWeather" id="weather1">
            The Weather in <span>${city}</span>
            <p class="results-value">${weather}</p>
        </h2>
        <img id="weatherImage" class="mainPic" src="cloud.png" alt="cloudiness">
        <div class="temperatureDisplay">
            ${temperatureDisplay}
    </div>
</div>
`);

    } else {
        $('main').append(`
        <div id="weatherPage">
        <h2 class="resultsWeather" id="weather1">
            The Weather in <span>${city}</span>
            <p class="results-value">${weather}</p>
        </h2>
        <img id="weatherImage" class="mainPic" src="sun2.png" alt="sun">
        <div class="temperatureDisplay">
            ${temperatureDisplay}
    </div>
</div>
`);
}

    uvRestart();
    let menu = document.getElementById('navList');
    if (menu.style.display === 'flex') {
        menu.style.display = 'none';
    }
}

function watchForm() {
    $('form').submit(event => {
      event.preventDefault();
      $('#js-location-input').geocomplete();
      const locationInput = $('#js-location-input').val();
      $('#js-location-input').val('');
      getLngLat(locationInput);
      buildNav();
    }); 
  }

startApp();
$(watchForm());
