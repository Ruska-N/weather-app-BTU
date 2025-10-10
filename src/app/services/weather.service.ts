import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { fetchWeatherApi } from 'openmeteo';
import { Observable, from, of } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class WeatherService {
  private geoApiUrl = 'https://geocoding-api.open-meteo.com/v1/search';

  constructor(private http: HttpClient) {}

  getCitySuggestions(term: string): Observable<string[]> {
    if (!term.trim()) {
      return of([]);
    }
    const url = `${this.geoApiUrl}?name=${term}&count=5&language=en&format=json`;

    return this.http.get<any>(url).pipe(
      map(
        (response) =>
          response?.results?.map(
            (city: any) => `${city.name}, ${city.country_code}`
          ) || []
      ),
      catchError(() => of([]))
    );
  }

  getCoordinatesForCity(
    city: string
  ): Observable<{ latitude: number; longitude: number } | null> {
    const url = `${this.geoApiUrl}?name=${city}&count=1&language=en&format=json`;
    return this.http.get<any>(url).pipe(
      map((response) => {
        if (response?.results?.length > 0) {
          const { latitude, longitude } = response.results[0];
          return { latitude, longitude };
        }
        return null;
      }),
      catchError(() => of(null))
    );
  }

  getWeather(city?: string): Observable<any> {
    const cityQuery = city || 'Tbilisi';

    return this.getCoordinatesForCity(cityQuery).pipe(
      switchMap((coords) => {
        if (coords) {
          return from(this.fetchWeatherData(coords.latitude, coords.longitude));
        }
        return of(null);
      })
    );
  }

  private async fetchWeatherData(latitude: number, longitude: number) {
    const params = {
      latitude,
      longitude,
      daily: ['weather_code', 'temperature_2m_min', 'temperature_2m_max'],
      hourly: ['temperature_2m', 'weather_code'],
      current: [
        'temperature_2m',
        'precipitation',
        'wind_speed_10m',
        'relative_humidity_2m',
        'apparent_temperature',
        'weather_code',
      ],
      timezone: 'auto',
    };
    const url = 'https://api.open-meteo.com/v1/forecast';
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
        time: Array.from(
          {
            length:
              (Number(hourly.timeEnd()) - Number(hourly.time())) /
              hourly.interval(),
          },
          (_, i) =>
            new Date(
              (Number(hourly.time()) +
                i * hourly.interval() +
                utcOffsetSeconds) *
                1000
            )
        ),
        temperature: Array.from(hourly.variables(0)!.valuesArray()!),
        weatherCode: Array.from(hourly.variables(1)!.valuesArray()!),
      },
      daily: {
        time: Array.from(
          {
            length:
              (Number(daily.timeEnd()) - Number(daily.time())) /
              daily.interval(),
          },
          (_, i) =>
            new Date(
              (Number(daily.time()) + i * daily.interval() + utcOffsetSeconds) *
                1000
            )
        ),
        weatherCode: Array.from(daily.variables(0)!.valuesArray()!),
        tempMin: Array.from(daily.variables(1)!.valuesArray()!),
        tempMax: Array.from(daily.variables(2)!.valuesArray()!),
      },
    };

    return weatherData;
  }
}
