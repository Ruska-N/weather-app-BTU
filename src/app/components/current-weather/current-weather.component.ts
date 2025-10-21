import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UnitSettings } from '../../services/weather.service';

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
  selector: 'app-current-weather',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './current-weather.component.html',
  styleUrls: ['./current-weather.component.css'],
})
export class CurrentWeatherComponent {
  @Input() currentWeather: any;
  @Input() settings!: UnitSettings;
  @Input() cityName!: string;

  constructor() {}

  get weatherIcon(): string {
    if (this.currentWeather && this.currentWeather.weatherCode !== undefined) {
      const iconName = weatherCodeToIcon(this.currentWeather.weatherCode);
      return `images/icon-${iconName}.webp`;
    }
    return 'images/icon-sunny.webp';
  }
}
