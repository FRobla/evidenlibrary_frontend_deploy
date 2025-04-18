import { Component, OnInit } from '@angular/core';
import { Libro } from '../libro/libro';
import { LibroService } from '../libro/libro.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../login/auth.service';
import { LibrosCompradosService } from '../services/libros-comprados.service';

@Component({
  selector: 'app-ranking',
  standalone: false,
  templateUrl: './ranking.component.html',
  styleUrl: './ranking.component.css'
})
export class RankingComponent implements OnInit {
  
  libros: Libro[] = [];  
  fragmentos: Libro[][] = [];
  librosPerSlide = 5;
  
  constructor(
    private libroService: LibroService, 
    private router: Router,
    public authService: AuthService,
    private librosCompradosService: LibrosCompradosService
  ) {}

  ngOnInit(): void {
    // Si el usuario está logueado, cargamos sus libros comprados
    if (this.authService.estaLogueado()) {
      const usuarioId = this.authService.getCurrentUserId();
      this.librosCompradosService.cargarLibrosComprados(usuarioId).subscribe(
        () => this.cargarLibros()
      );
    } else {
      this.cargarLibros();
    }
  }

  cargarLibros(): void {
    this.libroService.getMejorValorados().subscribe(
      (libros: Libro[]) => {
        this.libros = libros;
        this.fragmentarLibros();
      }
    );
  }

  fragmentarLibros(): void {
    this.fragmentos = [];
    for (let i = 0; i < this.libros.length; i += this.librosPerSlide) {
      this.fragmentos.push(this.libros.slice(i, i + this.librosPerSlide));
    }
  }

  // Método para ver detalles de un libro
  verDetallesLibro(bookId: number): void {
    if (bookId !== undefined) {
      this.router.navigate(['/libro', bookId]);
    } else {
      console.error('ID de libro indefinido');
    }
  }

  /**
   * Verifica si el usuario ha comprado un libro
   * @param libroId ID del libro
   * @returns true si el usuario ha comprado el libro, false en caso contrario
   */
  haCompradoLibro(libroId: number): boolean {
    if (!this.authService.estaLogueado()) {
      return false;
    }
    const usuarioId = this.authService.getCurrentUserId();
    return this.librosCompradosService.haCompradoLibro(usuarioId, libroId);
  }
}
