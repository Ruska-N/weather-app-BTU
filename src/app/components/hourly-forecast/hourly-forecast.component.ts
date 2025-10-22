import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UnitSettings } from '../../services/weather.service';

@Component({
  selector: 'app-hourly-forecast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hourly-forecast.component.html',
  styleUrl: './hourly-forecast.component.css',
})
export class HourlyForecastComponent implements OnChanges {
  @Input() hourlyData: {
    time: string;
    date: Date;
    temperature: number;
    icon: string;
  }[] = [];
  @Input() settings!: UnitSettings;

  isDropdownOpen = false;
  days: string[] = [];
  selectedDay!: string;
  displayData: any[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['hourlyData'] && this.hourlyData?.length > 0) {
      this.initializeDays();
      this.filterDataForSelectedDay();
    }
  }

  private initializeDays(): void {
    const daySet = new Set<string>();
    this.hourlyData.forEach((hour) => {
      daySet.add(hour.date.toLocaleDateString('en-US', { weekday: 'long' }));
    });
    this.days = Array.from(daySet);
    if (this.days.length > 0 && !this.selectedDay) {
      this.selectedDay = this.days[0];
    }
  }

  private filterDataForSelectedDay(): void {
    if (!this.selectedDay || this.hourlyData.length === 0) {
      this.displayData = [];
      return;
    }

    const now = new Date();
    const filteredByDay = this.hourlyData.filter((hour) => {
      const dayName = hour.date.toLocaleDateString('en-US', {
        weekday: 'long',
      });
      return dayName === this.selectedDay;
    });

    const isToday =
      this.selectedDay === now.toLocaleDateString('en-US', { weekday: 'long' });

    const startIndex = isToday
      ? filteredByDay.findIndex((hour) => hour.date > now)
      : 0;

    const validStartIndex = startIndex === -1 ? 0 : startIndex;

    this.displayData = filteredByDay.slice(
      validStartIndex,
      validStartIndex + 8
    );
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  selectDay(day: string): void {
    this.selectedDay = day;
    this.filterDataForSelectedDay();
    this.isDropdownOpen = false;
  }
}
