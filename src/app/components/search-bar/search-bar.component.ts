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
import { Subject, Observable, of } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  catchError,
} from 'rxjs/operators';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.css'],
})
export class SearchBarComponent {
  searchQuery: string = '';
  suggestions$: Observable<string[]>;
  showSuggestions = false;

  private searchTerms = new Subject<string>();

  @Output() search = new EventEmitter<string>();

  constructor(
    private weatherService: WeatherService,
    private elementRef: ElementRef
  ) {
    this.suggestions$ = this.searchTerms.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((term: string) =>
        term ? this.weatherService.getCitySuggestions(term) : of([])
      ),
      catchError(() => of([]))
    );
  }

  onFocus(): void {
    this.showSuggestions = true;
  }

  @HostListener('window:click', ['$event'])
  onWindowClick(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.showSuggestions = false;
    }
  }

  onInputChange(): void {
    this.searchTerms.next(this.searchQuery);
    if (this.searchQuery) {
      this.showSuggestions = true;
    }
  }

  selectCity(city: string): void {
    this.searchQuery = city;
    this.showSuggestions = false;
    this.onSearch();
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      this.search.emit(this.searchQuery.trim());
      this.showSuggestions = false;
    }
  }
}
