import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { fetchWeatherApi } from 'openmeteo';
import { Observable, from, of } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';

export interface UnitSettings {
  temperature: 'celsius' | 'fahrenheit';
  wind: 'kmh' | 'mph';
  precipitation: 'mm' | 'inches';
}

const weatherCodeToIcon = (code: number): string => {
  if (code === 0) return 'sunny';
  if (code >= 1 && code <= 3) return 'partly-cloudy';
  if (code === 45 || code === 48) return 'fog';
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return 'rain';
  if ([71, 73, 75, 85, 86].includes(code)) return 'snow';
  if ([95, 96, 99].includes(code)) return 'storm';
  return 'sunny'; 
};

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

  getWeather(city: string, units: UnitSettings): Observable<any> {
    return this.getCoordinatesForCity(city).pipe(
      switchMap((coords) => {
        if (coords) {
          return from(
            this.fetchWeatherData(coords.latitude, coords.longitude, units)
          );
        }
        return of(null);
      }),
      catchError(() => {
        return new Observable((observer) => {
          observer.error(new Error('Failed to fetch weather data.'));
        });
      })
    );
  }

  private async fetchWeatherData(
    latitude: number,
    longitude: number,
    units: UnitSettings
  ) {
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
      temperature_unit: units.temperature,
      wind_speed_unit: units.wind === 'kmh' ? 'kmh' : 'ms', 
      precipitation_unit: units.precipitation === 'mm' ? 'mm' : 'inch',
    };
    const url = 'https://api.open-meteo.com/v1/forecast';
    const responses = await fetchWeatherApi(url, params as any);

    const response = responses[0];
    const utcOffsetSeconds = response.utcOffsetSeconds();
    const current = response.current()!;
    const hourly = response.hourly()!;
    const daily = response.daily()!;

    const hourlyData = Array.from(
      {
        length:
          (Number(hourly.timeEnd()) - Number(hourly.time())) /
          hourly.interval(),
      },
      (_, i) => {
        const time = new Date(
          (Number(hourly.time()) + i * hourly.interval() + utcOffsetSeconds) *
            1000
        );
        return {
          time: time.toLocaleTimeString('en-US', {
            hour: 'numeric',
            hour12: true,
          }),
          date: time,
          temperature: hourly.variables(0)!.valuesArray()![i],
          weatherCode: hourly.variables(1)!.valuesArray()![i],
          icon: weatherCodeToIcon(hourly.variables(1)!.valuesArray()![i]),
        };
      }
    );

    const dailyData = Array.from(
      {
        length:
          (Number(daily.timeEnd()) - Number(daily.time())) / daily.interval(),
      },
      (_, i) => {
        const time = new Date(
          (Number(daily.time()) + i * daily.interval() + utcOffsetSeconds) *
            1000
        );
        return {
          day: time.toLocaleDateString('en-US', { weekday: 'short' }),
          date: time,
          weatherCode: daily.variables(0)!.valuesArray()![i],
          icon: weatherCodeToIcon(daily.variables(0)!.valuesArray()![i]),
          tempMin: daily.variables(1)!.valuesArray()![i],
          tempMax: daily.variables(2)!.valuesArray()![i],
        };
      }
    );

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
      hourly: hourlyData,
      daily: dailyData,
    };

    return weatherData;
  }
}
