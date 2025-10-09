import { Component, OnInit } from '@angular/core';
import { WeatherService } from '../../services/weather.service';

@Component({
  selector: 'app-main-weather',
  templateUrl: './main-weather.component.html',
  styleUrls: ['./main-weather.component.css']
})
export class MainWeatherComponent implements OnInit {
  weatherData: any;
  loading = true;
  error: string | null = null;

  constructor(private weatherService: WeatherService) {}

  ngOnInit(): void {
    this.weatherService.getWeather().subscribe({
      next: (data) => {
        console.log('Weather API data:', data);
        this.weatherData = data;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Failed to load weather data';
        this.loading = false;
      }
    });
  }
}

