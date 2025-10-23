import {
  Component,
  ElementRef,
  HostListener,
  Output,
  EventEmitter,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface UnitSettings {
  temperature: 'celsius' | 'fahrenheit';
  wind: 'kmh' | 'mph';
  precipitation: 'mm' | 'inches';
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent {
  isDropdownOpen = false;

  settings: UnitSettings = {
    temperature: 'celsius',
    wind: 'kmh',
    precipitation: 'mm',
  };

  @Output() settingsChanged = new EventEmitter<UnitSettings>();

  constructor(private elementRef: ElementRef) {}

  toggleDropdown(event: Event): void {
    event.stopPropagation();
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  @HostListener('window:click', ['$event'])
  onWindowClick(event: Event): void {
    if (
      this.isDropdownOpen &&
      !this.elementRef.nativeElement.contains(event.target)
    ) {
      this.isDropdownOpen = false;
    }
  }

  toggleSystem(system: 'imperial' | 'metric'): void {
    if (system === 'imperial') {
      this.settings = {
        temperature: 'fahrenheit',
        wind: 'mph',
        precipitation: 'inches',
      };
    } else {
      this.settings = {
        temperature: 'celsius',
        wind: 'kmh',
        precipitation: 'mm',
      };
    }
    this.updateSettings();
  }

  onUnitChange(
    category: keyof UnitSettings,
    value: 'celsius' | 'fahrenheit' | 'kmh' | 'mph' | 'mm' | 'inches'
  ): void {
    if (this.settings[category] !== value) {
      (this.settings[category] as any) = value;
      this.updateSettings();
    }
  }

  updateSettings(): void {
    this.settingsChanged.emit(this.settings);
  }
}
