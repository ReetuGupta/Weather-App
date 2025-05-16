const API_key = "b0b4f9b519053065448fca5f161ce112";

let yourWeather = document.querySelector(".weather-tab");
let searchWeather = document.querySelector("[data-searchWeather]");
let userContainer = document.querySelector(".weather-container");
let weatherDisplaySection = document.querySelector(".weather-display-section");
let grantAccess = document.querySelector(".grant-access");
let searchSection = document.querySelector(".search-section");
let searchInp = document.querySelector("[search-bar]");
let apiErrorContainer = document.querySelector(".api-error-container");
let loadingSection = document.querySelector(".loading-section");

let currentTab = yourWeather;
currentTab.classList.add("active");

function switchTab(clickedTab){
    apiErrorContainer.classList.remove("active");
    if(clickedTab !== currentTab){
        currentTab.classList.remove("active");
        currentTab = clickedTab;
        currentTab.classList.add("active");

        if(!searchSection.classList.contains("active")){
            weatherDisplaySection.classList.remove("active");
            grantAccess.classList.remove("active");
            searchSection.classList.add("active");
        }else{
            searchSection.classList.remove("active");
            weatherDisplaySection.classList.remove("active")
            getfromSessionStorage();
        }
    }
}

yourWeather.addEventListener("click", () => {
    switchTab(yourWeather);
});

searchWeather.addEventListener('click', () => {
    switchTab(searchWeather);
});

let accessBtn = document.querySelector(".grant-access-btn");
let messageText = document.querySelector(".location-allow");
let apiErrorImg = document.querySelector("[data-notFoundImg]");
let apiErrorMessage = document.querySelector("[data-apiErrorText]");
let apiErrorBtn = document.querySelector("[data-apiErrorBtn]");

//Check if coordinates are already present in Session Storage
function getfromSessionStorage(){
    const localCoordinates = sessionStorage.getItem("user-coordinates");
    if(!localCoordinates){
        grantAccess.classList.add("active");
    }else{
        const coordinates = JSON.parse(localCoordinates);
        fetchUserWeatherInfo(coordinates);
    }
}

//Get Coordinates using geoLocation
function locationAccess(){
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    }else{
        accessBtn.style.display = "none";
        messageText.innerHTML = "Geolocation is not supported by this browser."
    }
}

//Store User Coordinates
function showPosition(position){
    const userCoordinates = {
        lat: position.coords.latitude,
        longi: position.coords.longitude,
    };
    sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
    fetchUserWeatherInfo(userCoordinates);
}

//Handle error
function showError(error){
   switch(error.code){
    case error.PERMISSION_DENIED:
      messageText.innerText = "You denied the request for Geolocation.";
      break;
    case error.POSITION_UNAVAILABLE:
      messageText.innerText = "Location information is unavailable.";
      break;
    case error.TIMEOUT:
      messageText.innerText = "The request to get user location timed out.";
      break;
    case error.UNKNOWN_ERROR:
      messageText.innerText = "An unknown error occurred.";
      break;
   }
}

getfromSessionStorage();

accessBtn.addEventListener( 'click', locationAccess);

async function fetchUserWeatherInfo(coordinates){
    const {lat, longi} = coordinates;

    grantAccess.classList.remove("active");
    loadingSection.classList.add("active");

    try{
        let response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${longi}&appid=${API_key}&units=metric`);
        let data = await response.json();
    
        if (!data.sys) {
            throw data;
        }

        loadingSection.classList.remove("active");
        weatherDisplaySection.classList.add("active");
        renderUI(data);
    }catch(e){
        loadingSection.classList.remove("active");
        apiErrorContainer.classList.add("active");
        apiErrorImg.style.display = "none";
        apiErrorMessage.innerText = `Error: ${e?.message}`;
    }
    
}

let cityName = document.querySelector(".city-name");
let cityFlag = document.querySelector(".city-flag");
let cityWeather = document.querySelector(".city-weather");
let weatherImg = document.querySelector(".weather-img");
let temperature = document.querySelector(".temperature");
let windspeed = document.querySelector(".city-windspeed");
let humidity = document.querySelector(".city-humidity");
let cloud = document.querySelector(".city-cloud")

function renderUI(data){
    // weatherDisplaySection.classList.add("active");

    cityName.innerHTML = data?.name;
    cityFlag.src = `https://flagcdn.com/144x108/${data?.sys?.country.toLowerCase()}.png`;
    cityWeather.innerHTML = data?.weather?.[0]?.main;
    weatherImg.src = `https://openweathermap.org/img/w/${data?.weather?.[0]?.icon}.png`;
    // let tempC = data?.main?.temp - 273.15;
    temperature.innerHTML = `${data?.main?.temp.toFixed(2)} &#8451;`;
    windspeed.innerHTML = `${data?.wind?.speed}m/s`;
    humidity.innerHTML = `${data?.main?.humidity}%`;
    cloud.innerHTML = `${data?.clouds?.all}%`;
}

searchSection.addEventListener("submit", (e) => {
    e.preventDefault();
    if(searchInp.value === "") return;

    fetchSearchWeatherInfo(searchInp.value);
    searchInp.value = "";
});

async function fetchSearchWeatherInfo(city) {
    weatherDisplaySection.classList.remove("active");
    apiErrorContainer.classList.remove("active");
    loadingSection.classList.add("active");
    
    try {
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_key}&units=metric`);
    const data = await res.json();
    // console.log("Search - Api Fetch Data", data);
    if (!data.sys) {
      throw data;
    }
    loadingSection.classList.remove("active");
    weatherDisplaySection.classList.add("active");
    renderUI(data);
  } catch (error) {
    // console.log("Search - Api Fetch Error", error.message);
    loadingSection.classList.remove("active");
    apiErrorContainer.classList.add("active");
    apiErrorMessage.innerText = `${error?.message}`;
    apiErrorBtn.style.display = "block";
    apiErrorBtn.addEventListener("click", () => fetchSearchWeatherInfo(city));
  }
}