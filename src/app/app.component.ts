import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  HeaderComponent,
  UnitSettings,
} from './components/header/header.component';
import { SearchBarComponent } from './components/search-bar/search-bar.component';
import { CurrentWeatherComponent } from './components/current-weather/current-weather.component';
import { DailyForecastComponent } from './components/daily-forecast/daily-forecast.component';
import { HourlyForecastComponent } from './components/hourly-forecast/hourly-forecast.component';

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
      <app-search-bar></app-search-bar>
      <app-current-weather></app-current-weather>
      <app-daily-forecast></app-daily-forecast>
      <app-hourly-forecast></app-hourly-forecast>
    </main>
  `,
})
export class AppComponent {
  currentSettings: UnitSettings = {
    temperature: 'celsius',
    wind: 'kmh',
    precipitation: 'mm',
  };

  onSettingsChange(settings: UnitSettings) {
    this.currentSettings = settings;
  }
}
