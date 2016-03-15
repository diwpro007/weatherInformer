'use strict';

var urlLocation = "http://ip-api.com/json";
var weatherKEY = "a5a7196203ac7295d282a2b619589c03";

//var urlWeather = "http://api.openweathermap.org/data/2.5/weather?APPID=a5a7196203ac7295d282a2b619589c03&lat=27.7167&lon=85.3167";
var urlWeather = "http://api.openweathermap.org/data/2.5/weather";

var urlForecast = "http://api.openweathermap.org/data/2.5/forecast";

//https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=7ec171946ee9b44dab114e85a9746e74&tags=thunder,weather&tag_mode=all&sort=random&per_page=1&format=json&nojsoncallback=1

var imageKEY = '7ec171946ee9b44dab114e85a9746e74';

var urlImage = "https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=7ec171946ee9b44dab114e85a9746e74&tag_mode=all&privacy_filter=1&sort=random&per_page=20&format=json&nojsoncallback=1&tags=weather,";
//thunder,weather";

var finalImageUrl = "";

var randIndex = 0;

var getRandomBetween = function (min, max) {
    console.log(Math.floor(Math.random() * (max - min)) + min);
    return Math.floor(Math.random() * (max - min)) + min;
};



var getDay = function (timestamp) {
    timestamp *= 1000; //js timestamp in ms
    var timeReadable = new Date();
    timeReadable.setTime(timestamp);
    return timeReadable.getDay();
};

var days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

angular.module("weatherInformer", [])
    .controller('mainCtrl', function ($scope, $http) {
        var windDeg = 0;
        var windDirs = ['NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW', 'N'];

        $scope.location = {};
        $scope.location.lat = 0;
        $scope.location.long = 0;
        $scope.location.city = "---";
        $scope.location.country = "---";


        $scope.weather = {};
        $scope.weather.summary = "---";
        $scope.weather.windSpeed = "0.00";
        $scope.weather.windDir = "---";
        $scope.weather.icon = "wi wi-na";
        $scope.weather.pressure = "----";
        $scope.weather.temperature = "---";
        $scope.weather.humidity = "---";
        $scope.weather.time_raw = 0;
        $scope.weather.url = '';

        $scope.forecasts = [];



        //get the weather and location data
        $http.get(urlLocation)
            .then(function (response) {
                $scope.location.city = response.data["city"];
                $scope.location.country = response.data["country"];
                $scope.location.lat = response.data["lat"];
                $scope.location.long = response.data["lon"];


                urlWeather += "?APPID=";
                urlWeather += weatherKEY;
                urlWeather += "&lat=";
                urlWeather += $scope.location.lat;
                urlWeather += "&lon=";
                urlWeather += $scope.location.long;
                urlWeather += "&units=metric";

                $http.get(urlWeather)
                    .then(function (res) {

                        $scope.weather.time_raw = res.data.dt;


                        $scope.weather.summary = res.data.weather[0].main;
                        $scope.weather.icon = "wi wi-owm-" + res.data.weather[0].id;
                        $scope.weather.windSpeed = res.data.wind.speed;
                        windDeg = res.data.wind.deg;
                        $scope.weather.windDir = windDirs[Math.floor((windDeg - 11.25) / 22.5)];

                        $scope.weather.pressure = res.data.main.pressure;
                        $scope.weather.temperature = res.data.main.temp;
                        $scope.weather.humidity = res.data.main.humidity;

                        var dayOfWeek = getDay($scope.weather.time_raw);
                        for (var i = 1; i <= 5; i++) {
                            $scope.forecasts.push({
                                "day_no": (dayOfWeek + i) % 7,
                                "day": days[(dayOfWeek + i) % 7],
                                "conditionClass": "forecast-icon wi wi-na"
                            });
                        }

                        urlImage += $scope.weather.summary;
                        //                        console.log(urlImage);

                        $http.get(urlImage).then(function (response) {
                            randIndex = getRandomBetween(0, 19);
                            var linkThumb = '';
                            linkThumb += 'http://farm' + response.data.photos.photo[randIndex].farm + '.staticflickr.com/' + response.data.photos.photo[randIndex].server + '/' + response.data.photos.photo[randIndex].id + '_' + response.data.photos.photo[randIndex].secret + '_h.jpg';
                            document.body.style.background = "url(" + linkThumb + ")" + " no-repeat center center fixed";
                        });

                        urlForecast += "?APPID=";
                        urlForecast += weatherKEY;
                        urlForecast += "&lat=";
                        urlForecast += $scope.location.lat;
                        urlForecast += "&lon=";
                        urlForecast += $scope.location.long;
                        urlForecast += "&units=metric";

                        $http.get(urlForecast)
                            .then(function (res) {
                                var currIndex = 0;
                                var toTrack = 0;
                                var forecastList = res.data.list;
                                for (var forecast in forecastList) {
                                    if (currIndex <= 4) {
                                        if (getDay(forecastList[forecast].dt) === $scope.forecasts[currIndex].day_no) {

                                            $scope.forecasts[currIndex].conditionClass = "forecast-icon wi wi-owm-" + forecastList[forecast].weather[0].id;
                                            currIndex++;
                                        }
                                    }

                                }
                            });
                    });
            });
    });