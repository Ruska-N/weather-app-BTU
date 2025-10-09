// src/app/services/weather.service.ts
import { Injectable } from '@angular/core';
import { fetchWeatherApi } from 'openmeteo';
import { Observable, from } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {

  async fetchWeather() {
    const params = {
      latitude: 41.7151, 
      longitude: 44.8271,
      daily: ["weather_code", "temperature_2m_min", "temperature_2m_max"],
      hourly: ["temperature_2m", "weather_code"],
      current: ["temperature_2m", "precipitation", "wind_speed_10m", "relative_humidity_2m", "apparent_temperature", "weather_code"],
    };
    const url = "https://api.open-meteo.com/v1/forecast";

    const responses = await fetchWeatherApi(url, params);
    const response = responses[0];

    const utcOffsetSeconds = response.utcOffsetSeconds();
    const current = response.current()!;
    const hourly = response.hourly()!;
    const daily = response.daily()!;

    const weatherData = {
      current: {
        time: new Date((Number(current.time()) + utcOffsetSeconds) * 1000),
        temperature: current.variables(0)!.value(),
        precipitation: current.variables(1)!.value(),
        windSpeed: current.variables(2)!.value(),
        humidity: current.variables(3)!.value(),
        feelsLike: current.variables(4)!.value(),
        weatherCode: current.variables(5)!.value(),
      },
      hourly: {
        time: [...Array((Number(hourly.timeEnd()) - Number(hourly.time())) / hourly.interval())].map(
          (_, i) => new Date((Number(hourly.time()) + i * hourly.interval() + utcOffsetSeconds) * 1000)
        ),
        temperature: hourly.variables(0)!.valuesArray(),
        weatherCode: hourly.variables(1)!.valuesArray(),
      },
      daily: {
        time: [...Array((Number(daily.timeEnd()) - Number(daily.time())) / daily.interval())].map(
          (_, i) => new Date((Number(daily.time()) + i * daily.interval() + utcOffsetSeconds) * 1000)
        ),
        weatherCode: daily.variables(0)!.valuesArray(),
        tempMin: daily.variables(1)!.valuesArray(),
        tempMax: daily.variables(2)!.valuesArray(),
      },
    };

    return weatherData;
  }

  
  getWeather(): Observable<any> {
    return from(this.fetchWeather());
  }
}
