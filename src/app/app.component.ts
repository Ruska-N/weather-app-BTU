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

type UiState = 'initial' | 'loading' | 'success' | 'no_results' | 'error';

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
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  uiState: UiState = 'initial';
  weatherData: any = null;
  currentLocation: string = 'Tbilisi, Georgia';
  settings: UnitSettings = {
    temperature: 'celsius',
    wind: 'kmh',
    precipitation: 'mm',
  };
  errorMessage: string = '';

  constructor(private weatherService: WeatherService) {}

  ngOnInit(): void {
    this.loadWeather(this.currentLocation);
  }

  loadWeather(city: string | any): void {
    const safeCity =
      typeof city === 'string' && city.trim()
        ? city
        : this.currentLocation || '';

    if (!safeCity) {
      this.uiState = 'no_results';
      return;
    }

    this.uiState = 'loading';
    this.currentLocation = safeCity;

    this.weatherService.getWeather(safeCity, this.settings).subscribe({
      next: (data) => {
        if (data) {
          this.weatherData = data;
          this.uiState = 'success';
        } else {
          this.uiState = 'no_results';
        }
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Failed to load weather data.';
        this.uiState = 'error';
      },
    });
  }

  handleSearch(city: string | Event | any): void {
    const safeCity = typeof city === 'string' ? city : '';

    this.loadWeather(safeCity);
  }

  onSettingsChange(newSettings: UnitSettings): void {
    this.settings = newSettings;
    this.loadWeather(this.currentLocation);
  }
}
