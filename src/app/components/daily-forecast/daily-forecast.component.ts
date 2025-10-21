import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface DailyForecast {
  day: string;
  date: Date;
  weatherCode: number;
  icon: string;
  tempMin: number;
  tempMax: number;
}

@Component({
  selector: 'app-daily-forecast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './daily-forecast.component.html',
  styleUrls: ['./daily-forecast.component.css'],
})
export class DailyForecastComponent {
  @Input() dailyData: DailyForecast[] = [];
}
