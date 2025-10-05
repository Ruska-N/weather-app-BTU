import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class WeatherService {
  constructor() {}

  getWeatherForCity(city: string): Observable<any> {
    const fakeWeatherData = {
      name: city,
      sys: { country: 'MOCK' },
      main: { temp: 21, feels_like: 19, humidity: 55 },
      weather: [{ description: 'clear sky' }],
      wind: { speed: 10 },
    };
    return of(fakeWeatherData).pipe(delay(500));
  }

  // This is the corrected method. It now properly filters and returns cities.
  getCitySuggestions(query: string): Observable<string[]> {
    const allCities = [
      'Berlin',
      'London',
      'New York',
      'Paris',
      'Tokyo',
      'Tbilisi',
    ];

    if (!query.trim()) {
      return of([]);
    }

    const filteredCities = allCities.filter((city) =>
      city.toLowerCase().startsWith(query.toLowerCase())
    );

    return of(filteredCities).pipe(delay(200));
  }
}
