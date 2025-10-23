import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { fetchWeatherApi } from 'openmeteo';
import { Observable, from, of, throwError } from 'rxjs';
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
    const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });

    return this.http.get<any>(url).pipe(
      map(
        (response) =>
          response?.results?.map((city: any) => {
            const countryFullName = regionNames.of(city.country_code);
            return `${city.name}, ${countryFullName}`;
          }) || []
      ),
      catchError(() => of([]))
    );
  }

  getCoordinatesForCity(
    city: string
  ): Observable<{ latitude: number; longitude: number } | null> {
    if (typeof city !== 'string' || !city.trim()) {
      return of(null);
    }

    const cityName = city.split(',')[0].trim();

    const url = `${this.geoApiUrl}?name=${cityName}&count=1&language=en&format=json`;

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
      catchError((err) => {
        console.error(err);
        return throwError(() => new Error('Failed to fetch weather data.'));
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
      wind_speed_unit: units.wind,
      precipitation_unit: units.precipitation === 'inches' ? 'inch' : 'mm',
    };
    const url = 'https://api.open-meteo.com/v1/forecast';
    const responses = await fetchWeatherApi(url, params as any);

    const response = responses[0];
    const utcOffsetSeconds = response.utcOffsetSeconds();

    const current = response.current();
    const hourly = response.hourly();
    const daily = response.daily();

    if (!current || !hourly || !daily) {
      throw new Error('Incomplete weather data received from API.');
    }

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
        const temperature = hourly.variables(0)?.valuesArray()?.[i] ?? 0;
        const weatherCode = hourly.variables(1)?.valuesArray()?.[i] ?? 0;
        return {
          time: time.toLocaleTimeString('en-US', {
            hour: 'numeric',
            hour12: true,
          }),
          date: time,
          temperature: temperature,
          weatherCode: weatherCode,
          icon: weatherCodeToIcon(weatherCode),
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
        const weatherCode = daily.variables(0)?.valuesArray()?.[i] ?? 0;
        const tempMin = daily.variables(1)?.valuesArray()?.[i] ?? 0;
        const tempMax = daily.variables(2)?.valuesArray()?.[i] ?? 0;

        return {
          day: time.toLocaleDateString('en-US', { weekday: 'short' }),
          date: time,
          weatherCode: weatherCode,
          icon: weatherCodeToIcon(weatherCode),
          tempMin: Math.round(tempMin),
          tempMax: Math.round(tempMax),
        };
      }
    );

    const weatherData = {
      current: {
        time: new Date((Number(current.time()) + utcOffsetSeconds) * 1000),
        temperature: current.variables(0)?.value() ?? 0,
        precipitation: current.variables(1)?.value() ?? 0,
        windSpeed: current.variables(2)?.value() ?? 0,
        humidity: current.variables(3)?.value() ?? 0,
        feelsLike: current.variables(4)?.value() ?? 0,
        weatherCode: current.variables(5)?.value() ?? 0,
        icon: weatherCodeToIcon(current.variables(5)?.value() ?? 0),
      },
      hourly: hourlyData,
      daily: dailyData,
    };

    return weatherData;
  }
  async fetchWeather() {
    const params = {
      latitude: 41.7151,
      longitude: 44.8271,
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
        time: [
          ...Array(
            (Number(hourly.timeEnd()) - Number(hourly.time())) /
              hourly.interval()
          ),
        ].map(
          (_, i) =>
            new Date(
              (Number(hourly.time()) +
                i * hourly.interval() +
                utcOffsetSeconds) *
                1000
            )
        ),
        temperature: hourly.variables(0)!.valuesArray(),
        weatherCode: hourly.variables(1)!.valuesArray(),
      },
      daily: {
        time: [
          ...Array(
            (Number(daily.timeEnd()) - Number(daily.time())) / daily.interval()
          ),
        ].map(
          (_, i) =>
            new Date(
              (Number(daily.time()) + i * daily.interval() + utcOffsetSeconds) *
                1000
            )
        ),
        weatherCode: daily.variables(0)!.valuesArray(),
        tempMin: daily.variables(1)!.valuesArray(),
        tempMax: daily.variables(2)!.valuesArray(),
      },
    };

    return weatherData;
  }
}
