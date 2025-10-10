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
  styleUrls: ['./hourly-forecast.component.css'],
})
export class HourlyForecastComponent {
  @Input() hourlyData: HourlyForecast[] = [];
  @Input() settings: UnitSettings = {
    temperature: 'celsius',
    wind: 'kmh',
    precipitation: 'mm',
  };

  @Output() dayChanged = new EventEmitter<string>();

  isDropdownOpen = false;
  days = [
    'Today',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];
  selectedDay = 'Today';

  constructor(private elementRef: ElementRef) {}

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  selectDay(day: string): void {
    this.selectedDay = day;
    this.isDropdownOpen = false;
    this.dayChanged.emit(day);
  }

  @HostListener('window:click', ['$event'])
  onWindowClick(event: Event): void {
    const dropdownWrapper = this.elementRef.nativeElement.querySelector(
      '.day-selector-wrapper'
    );
    if (
      this.isDropdownOpen &&
      dropdownWrapper &&
      !dropdownWrapper.contains(event.target)
    ) {
      this.isDropdownOpen = false;
    }
  }
}
