import {
  Component,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { UnitSettings } from '../header/header.component';

export interface HourlyForecast {
  time: string;
  icon: string;
  temperature: {
    celsius: number;
    fahrenheit: number;
  };
}

@Component({
  selector: 'app-hourly-forecast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hourly-forecast.component.html',
  styleUrl: './hourly-forecast.component.css',
})
export class HourlyForecastComponent {}
