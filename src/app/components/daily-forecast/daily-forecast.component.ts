import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UnitSettings } from '../header/header.component';

@Component({
  selector: 'app-daily-forecast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="daily-forecast-container" *ngIf="dailyData.length > 0">
      <div class="header">
        <h2 class="title">Daily forecast</h2>
      </div>
      <div class="forecast-list">
        <div class="forecast-item" *ngFor="let day of dailyData">
          <span class="day">{{ day.day }}</span>
          <img
            [src]="'images/icon-' + day.icon + '.webp'"
            [alt]="day.icon + ' icon'"
            class="weather-icon"
          />
          <div class="temperature">
            <span *ngIf="settings.temperature === 'celsius'"
              >{{ day.temperature.min.celsius }}°/{{
                day.temperature.max.celsius
              }}°</span
            >
            <span *ngIf="settings.temperature === 'fahrenheit'"
              >{{ day.temperature.min.fahrenheit }}°/{{
                day.temperature.max.fahrenheit
              }}°</span
            >
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .daily-forecast-container {
        background-color: var(--dark-grey);
        border: 1px solid var(--border-grey);
        border-radius: 12px;
        padding: 24px;
        color: var(--white);
      }
      .header {
        margin-bottom: 24px;
      }
      .title {
        font-size: 20px;
        font-weight: 600;
        margin: 0;
      }
      .forecast-list {
        display: flex;
        justify-content: space-between;
        gap: 16px;
      }
      .forecast-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        background: #1a1a1a;
        border-radius: 8px;
        padding: 16px;
        flex-grow: 1;
      }
      .day {
        font-weight: 600;
      }
      .weather-icon {
        width: 40px;
        height: 40px;
      }
      .temperature {
        color: var(--grey-200);
      }
    `,
  ],
})
export class DailyForecastComponent {
  @Input() dailyData: any[] = [];
  @Input() settings!: UnitSettings;
}
