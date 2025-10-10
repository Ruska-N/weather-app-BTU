import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  HeaderComponent,
  UnitSettings,
} from './components/header/header.component';
import { SearchBarComponent } from './components/search-bar/search-bar.component';
import { CurrentWeatherComponent } from './components/current-weather/current-weather.component';
import { DailyForecastComponent } from './components/daily-forecast/daily-forecast.component';
import { HourlyForecastComponent } from './components/hourly-forecast/hourly-forecast.component';
import { WeatherService } from './services/weather.service';

const weatherCodeToIcon = (code: number): string => {
  if (code === 0) return 'sunny';
  if (code >= 1 && code <= 3) return 'partly-cloudy';
  if (code === 45 || code === 48) return 'fog';
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return 'rain';
  if ([71, 73, 75, 85, 86].includes(code)) return 'snow';
  if ([95, 96, 99].includes(code)) return 'storm';
  return 'sunny';
};

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    SearchBarComponent,
    CurrentWeatherComponent,
    DailyForecastComponent,
    HourlyForecastComponent,
  ],
  template: `
    <app-header (settingsChanged)="onSettingsChange($event)"></app-header>
    <main class="container">
      <app-search-bar (search)="handleSearch($event)"></app-search-bar>

      <div *ngIf="loading" class="loading-message">Loading weather data...</div>
      <div *ngIf="error" class="error-message">{{ error }}</div>

      <ng-container *ngIf="!loading && !error && weatherData">
        <app-current-weather
          [currentWeather]="weatherData.current"
          [settings]="currentSettings"
          [cityName]="currentCity"
        >
        </app-current-weather>
        <app-daily-forecast
          [dailyData]="processedDailyData"
          [settings]="currentSettings"
        ></app-daily-forecast>
        <app-hourly-forecast
          [hourlyData]="processedHourlyData"
          [settings]="currentSettings"
        ></app-hourly-forecast>
      </ng-container>
    </main>
  `,
})
export class AppComponent implements OnInit {
  currentSettings: UnitSettings = {
    temperature: 'celsius',
    wind: 'kmh',
    precipitation: 'mm',
  };
  weatherData: any = null;
  processedHourlyData: any[] = [];
  processedDailyData: any[] = [];
  loading = true;
  error: string | null = null;
  currentCity: string = 'Tbilisi';

  constructor(private weatherService: WeatherService) {}

  ngOnInit(): void {
    this.loadWeather(this.currentCity);
  }

  loadWeather(city: string): void {
    this.loading = true;
    this.error = null;
    this.currentCity = city.split(',')[0];
    this.weatherService.getWeather(city).subscribe({
      next: (data) => {
        if (data) {
          this.weatherData = data;
          this.processHourlyData();
          this.processDailyData();
        } else {
          this.error = `Could not find weather data for "${city}"`;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Failed to load weather data';
        this.loading = false;
      },
    });
  }

  processHourlyData(): void {
    const { time, temperature, weatherCode } = this.weatherData.hourly;
    this.processedHourlyData = time.map((date: Date, index: number) => {
      const celsius = Math.round(temperature[index]);
      return {
        date: date,
        time: date.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: false,
        }),
        temperature: {
          celsius: celsius,
          fahrenheit: Math.round((celsius * 9) / 5 + 32),
        },
        icon: weatherCodeToIcon(weatherCode[index]),
      };
    });
  }

  processDailyData(): void {
    const { time, tempMax, tempMin, weatherCode } = this.weatherData.daily;
    this.processedDailyData = time.map((date: Date, index: number) => {
      const maxCelsius = Math.round(tempMax[index]);
      const minCelsius = Math.round(tempMin[index]);
      return {
        date: date,
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        icon: weatherCodeToIcon(weatherCode[index]),
        temperature: {
          max: {
            celsius: maxCelsius,
            fahrenheit: Math.round((maxCelsius * 9) / 5 + 32),
          },
          min: {
            celsius: minCelsius,
            fahrenheit: Math.round((minCelsius * 9) / 5 + 32),
          },
        },
      };
    });
  }

  onSettingsChange(settings: UnitSettings): void {
    this.currentSettings = settings;
  }

  handleSearch(city: string): void {
    this.loadWeather(city);
  }
}
