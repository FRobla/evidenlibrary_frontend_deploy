import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SearchService } from '../search/search.service';
import { CarritoService } from '../carrito/carrito.service';
import { Libro } from '../libro/libro';
import { Carrito } from '../carrito/carrito';

@Component({
  selector: 'app-resultado-busqueda',
  standalone: false,
  templateUrl: './resultado-busqueda.component.html',
  styleUrl: './resultado-busqueda.component.css'
})
export class ResultadoBusquedaComponent implements OnInit {
  results: any = {libros: [], autores: [], generos: []};
  searchTerm: string = '';
  loading: boolean = true;
  noResults: boolean = false;
  searchType: string = 'all';
  librosRelacionados: Libro[] = [];

  constructor(
    private route: ActivatedRoute,
    private searchService: SearchService,
    private carritoService: CarritoService,
    private router: Router
  ){}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.searchTerm = params['q'] || '';
      
      if (!this.searchTerm.trim()) {
        this.router.navigate(['/principal']);
        return;
      }

      this.loading = true;
      this.librosRelacionados = []; // Resetear libros relacionados en cada búsqueda
      
      this.searchService.search(this.searchTerm.trim()).subscribe({
        next: (data) => {
          this.results = data;
          this.loading = false;
          
          // Determinar el tipo de búsqueda basado en los resultados
          this.searchType = this.detectSearchTypeFromResults(this.results);
          
          // Cargar libros relacionados según el tipo de búsqueda
          this.loadRelatedBooks();
          
          this.noResults = this.isEmptyResults();
        },
        error: (error) => {
          console.error('Error al obtener resultados: ', error);
          this.loading = false;
          this.noResults = true;
        }
      });
    });
  }

  private detectSearchTypeFromResults(results: any): string {
    // Si solo hay años y no hay libros, autores ni géneros
    if (results.anios?.length > 0 && 
      (!results.libros?.length || results.libros.length === 0) && 
      (!results.autores?.length || results.autores.length === 0) &&
      (!results.generos?.length || results.generos.length === 0)) {
      return 'anio';
    }

    // Si solo hay autores y no hay libros ni géneros
    if (results.autores?.length > 0 && 
        (!results.libros?.length || results.libros.length === 0) && 
        (!results.generos?.length || results.generos.length === 0)) {
      return 'autor';
    }
    
    // Si solo hay géneros y no hay libros ni autores
    if (results.generos?.length > 0 && 
        (!results.libros?.length || results.libros.length === 0) && 
        (!results.autores?.length || results.autores.length === 0)) {
      return 'genero';
    }

    // Si hay coincidencia exacta con un autor
    if (results.autores?.length === 1 && 
        results.autores[0].nombre.toLowerCase() === this.searchTerm.toLowerCase()) {
      return 'autor';
    }

    // Si hay coincidencia exacta con un género
    if (results.generos?.length === 1 && 
        results.generos[0].nombre.toLowerCase() === this.searchTerm.toLowerCase()) {
      return 'genero';
    }

    // Si hay coincidencia exacta con un año 
    if (results.anios?.length === 1) {
      const anio = results.anios[0];
      if (anio && anio.toString() === this.searchTerm.trim()) {
        return 'anio';
      }
    }

    // Por defecto, mostrar todos los resultados
    return 'all';
  }

  // Método para cargar libros relacionados según el tipo de búsqueda
  private loadRelatedBooks(): void {
    if (this.searchType === 'autor' && this.results.autores?.length > 0) {
      this.loadLibrosByAutor(this.results.autores[0].id);
    } else if (this.searchType === 'genero' && this.results.generos?.length > 0) {
      this.loadLibrosByGenero(this.results.generos[0].id);
    } else if (this.searchType === 'anio' && this.results.anios?.length > 0) {
      this.loadLibrosByAnio(this.results.anios[0]);
    }
  }

  private loadLibrosByAutor(autorId: number): void {
    this.searchService.getLibrosByAutor(autorId).subscribe({
      next: (libros) => {
        this.librosRelacionados = libros;
      },
      error: (error) => {
        console.error('Error al cargar libros del autor:', error);
        this.librosRelacionados = [];
      }
    });
  }

  private loadLibrosByGenero(generoId: number): void {
    this.searchService.getLibrosByGenero(generoId).subscribe({
      next: (libros) => {
        this.librosRelacionados = libros;
      },
      error: (error) => {
        console.error('Error al cargar libros del género:', error);
        this.librosRelacionados = [];
      }
    });
  }

  private loadLibrosByAnio(anio: string): void {
    this.searchService.getLibrosByAnio(anio).subscribe({
      next: (libros) => {
        this.librosRelacionados = libros;
      },
      error: (error) => {
        console.error('Error al cargar libros del año:', error);
        this.librosRelacionados = [];
      }
    });
  }

  private isEmptyResults(): boolean {
    // Si estamos en una búsqueda específica, consideramos si hay libros relacionados
    if (this.searchType === 'autor') {
      return this.results.autores.length === 0 && this.librosRelacionados.length === 0;
    }
    if (this.searchType === 'genero') {
      return this.results.generos.length === 0 && this.librosRelacionados.length === 0;
    }
    if (this.searchType === 'anio') {
      return this.results.anios.length === 0 && this.librosRelacionados.length === 0;
    }
    
    // Para búsqueda general
    return (!this.results.libros || this.results.libros.length === 0) &&
           (!this.results.autores || this.results.autores.length === 0) &&
           (!this.results.generos || this.results.generos.length === 0);
  }

  getDetallesLibro(libroId: number): void {
    this.router.navigate(['/libro', libroId]);
  }

}