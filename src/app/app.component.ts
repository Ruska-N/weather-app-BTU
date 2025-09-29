import { Component } from '@angular/core';
import { HeaderComponent } from './components/header/header.component';
import { SearchBarComponent } from './components/search-bar/search-bar.component';
import { CurrentWeatherComponent } from './components/current-weather/current-weather.component';
import { DailyForecastComponent } from './components/daily-forecast/daily-forecast.component';
import { HourlyForecastComponent } from './components/hourly-forecast/hourly-forecast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    HeaderComponent,
    SearchBarComponent,
    CurrentWeatherComponent,
    DailyForecastComponent,
    HourlyForecastComponent
  ],
  template: `
    <app-header></app-header>
    <app-search-bar></app-search-bar>
    <app-current-weather></app-current-weather>
    <app-daily-forecast></app-daily-forecast>
    <app-hourly-forecast></app-hourly-forecast>
  `,
})
export class AppComponent {}
