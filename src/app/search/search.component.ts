import { Component, EventEmitter, HostListener, OnInit, OnDestroy, Output } from '@angular/core';
import { SearchService } from './search.service';
import { Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-search',
  standalone: false,
  templateUrl: './search.component.html',
  styleUrl: './search.component.css'
})
export class SearchComponent implements OnInit, OnDestroy {
  searchTerm: string = '';
  searchResults: any = { libros: [], autores: [], generos: [] };
  showDropdown: boolean = false;
  private searchSubject = new Subject<string>();
  placeholder: string = 'Buscar por título, autor o género...';

  @Output() search = new EventEmitter<string>();

  constructor(
    private searchService: SearchService,
    private router: Router
  ){}

  ngOnInit() {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => {
      if (term.trim()) {
        this.searchForDropdown(term);
      } else {
        this.clearResults();
      }
    });
    
    // Set placeholder based on screen size
    this.updatePlaceholder();
    window.addEventListener('resize', this.updatePlaceholder.bind(this));
  }

  updatePlaceholder(): void {
    this.placeholder = window.innerWidth < 576 ? 'Busca tu libro...' : 'Buscar por título, autor o género...';
  }

  onSearchInput(event: any): void {
    const term = event.target.value;
    const cleanTerm = term;
    
    if (!term.trim()) {
      this.clearResults();
      return;
    }
    
    this.searchSubject.next(term);
  }

  clearResults(): void {
    this.showDropdown = false;
    this.searchResults = { libros: [], autores: [], generos: [] };
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.clearResults();
  }

  searchForDropdown(term: string): void {
    if (!term.trim()) {
      this.clearResults();
      return;
    }

    this.searchService.search(term).subscribe({
      next: (results) => {
        this.searchResults = results;
        this.showDropdown = this.hasResults(results);
      },
      error: (error) => {
        console.error('Error en la búsqueda: ', error);
        this.clearResults();
      }
    });
  }

  selectResult(type: string, item: any): void {
    this.showDropdown = false;
    this.clearSearch();

    switch(type) {
      case 'libro':
        this.router.navigate(['/libro', item.id]);
        break;
      case 'autor':
        //this.router.navigate(['/autores', item.id]);
        //this.router.navigate(['/autores']);
        this.router.navigate(['/libros/autor', item.id, 'page', 0, 'size',6]);
        break;
      case 'genero':
        //this.router.navigate(['/generos', item.id]);
        this.router.navigate(['/generos']);
        break;
    }
  }

  performFullSearch(): void {
    const term = this.searchTerm.trim();
    
    if (!term) {
      this.router.navigate(['/principal']);
      return;
    }

    this.showDropdown = false;

    this.searchService.search(term).subscribe({
      next: (results) => {
        if (this.isEmptyResults(results)) {
          this.router.navigate(['/search-results'], {
            queryParams: {
              q: term,
              noResults: true
            }
          });
        } else {
          this.router.navigate(['/search-results'], {
            queryParams: {
              q: term
            },
            state: { results }
          });
        }
      },
      error: (error) => {
        console.error('Error en la búsqueda: ', error);
      }
    });
  }

  isEmptyResults(results: any): boolean {
    return (!results.libros || results.libros.length === 0) &&
           (!results.autores || results.autores.length === 0) &&
           (!results.generos || results.generos.length === 0);
  }
  
  hasResults(results: any): boolean {
    return (results.libros && results.libros.length > 0) ||
           (results.autores && results.autores.length > 0) ||
           (results.generos && results.generos.length > 0);
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    const target = event.target as HTMLElement;
    this.clearSearch();

    if (target && target.closest && !target.closest('.search-container')) {//fuera de contenedor de busqueda
      this.showDropdown = false;
    }
    //limpia busqueda y oculta el dropdown
  }

  ngOnDestroy() {
    // Remove event listener on component destroy
    window.removeEventListener('resize', this.updatePlaceholder.bind(this));
    this.searchSubject.unsubscribe();
  }
}