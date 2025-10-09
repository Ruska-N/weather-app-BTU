import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WeatherService {
  private apiUrl =
    'https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&daily=weather_code,temperature_2m_min,temperature_2m_max&hourly=temperature_2m,weather_code&current=temperature_2m,precipitation,wind_speed_10m,relative_humidity_2m,apparent_temperature,weather_code';

  constructor(private http: HttpClient) {}

  getWeather(): Observable<any> {
    return this.http.get(this.apiUrl);
  }
}
