import {
  Component,
  EventEmitter,
  Output,
  ElementRef,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WeatherService } from '../../services/weather.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.css'],
})
export class SearchBarComponent {
  searchQuery: string = '';
  suggestions: string[] = [];
  showSuggestions = false;

  private searchTerms = new Subject<string>();

  @Output() search = new EventEmitter<string>();

  constructor(
    private weatherService: WeatherService,
    private elementRef: ElementRef
  ) {
    console.log('SearchBarComponent: Initialized'); // Log 1

    this.searchTerms
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((term: string) =>
          this.weatherService.getCitySuggestions(term)
        )
      )
      .subscribe({
        next: (cities: unknown) => {
          console.log(
            'SearchBarComponent: Received suggestions from service:',
            cities
          ); // Log 3
          if (Array.isArray(cities)) {
            this.suggestions = cities as string[];
            this.showSuggestions =
              this.searchQuery.length > 0 && cities.length > 0;
            console.log(
              'SearchBarComponent: showSuggestions is now:',
              this.showSuggestions
            ); // Log 4
          }
        },
        error: (err: unknown) => {
          console.error('SearchBarComponent: Error fetching suggestions:', err);
          this.showSuggestions = false;
        },
      });
  }

  onInputChange(): void {
    console.log('SearchBarComponent: Input changed:', this.searchQuery); // Log 2
    if (this.searchQuery.trim()) {
      this.searchTerms.next(this.searchQuery);
    } else {
      this.showSuggestions = false;
    }
  }

  selectCity(city: string): void {
    this.searchQuery = city;
    this.showSuggestions = false;
    this.onSearch();
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      this.search.emit(this.searchQuery);
      this.showSuggestions = false;
    }
  }

  @HostListener('window:click', ['$event'])
  onWindowClick(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.showSuggestions = false;
    }
  }
}
