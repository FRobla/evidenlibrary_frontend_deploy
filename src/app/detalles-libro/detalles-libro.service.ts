import { HttpClient } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { DetallesLibro } from './detalles-libro';
import { Libro } from '../libro/libro';
import { Valoracion } from '../valoracion/valoracion';
import { Router } from '@angular/router';
import swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class DetallesLibroService implements OnInit {

  private urlEndPoint: string = 'https://evidenlibrary-backend.onrender.com/api/libro';

  constructor(private http: HttpClient, private router: Router) {}
  ngOnInit(): void {}

  // Observable para que sea asíncrono (se actualice en tiempo real)
  getDetallesLibros(): Observable<DetallesLibro[]> {
    return this.http.get(this.urlEndPoint).pipe(
      // Conversión a libros (response de Object a Libro[])
      map((response) => {
        const detallesLibro = response as DetallesLibro[]

        return detallesLibro.map((detalles) => {
          detalles.libro.imagen = detalles.libro.imagen
          detalles.libro.titulo = detalles.libro.titulo
          detalles.libro.precio = detalles.libro.precio
          detalles.libro.autores = detalles.libro.autores
          detalles.libro.descripcion = detalles.libro.descripcion
          detalles.libro.valoraciones = detalles.libro.valoraciones
          detalles.libro.stock = detalles.libro.stock

          return detalles
        })
      }),
    )
  }
 
  obtenerLibroPorId(id: number): Observable<Libro> {
    return this.http.get<Libro>(`${this.urlEndPoint}/${id}`).pipe(
      map(libro => {
        if (!libro.autores) {
          libro.autores = [];
        }
        return libro;
      })
    );
  }

  // Crear libro
  create(libro: Libro) : Observable<any> {
    return this.http.post<any>(this.urlEndPoint, libro).pipe(
      catchError(e => {
        // Validamos
        if(e.status==400) {
          return throwError(e);
        }

        // Controlamos otros errores
        this.router.navigate(['/libros']);
        console.log(e.error.mensaje);
        swal(e.error.mensaje, e.error.error, 'error');
        return throwError(e);
      })
    );
  }

  // Obtener
  getLibro(id: number): Observable<Libro> {
    // pipe para canalizar errores
    return this.http.get<Libro>(`${this.urlEndPoint}/${id}`).pipe(
      catchError(e => {
        this.router.navigate(['/libros']);
        console.log(e.error.mensaje);
        swal('Error al obtener el libro', e.error.mensaje, 'error');
        return throwError(e);
      })
    );
  }

  // Update
  updateLibro(libro: Libro): Observable<any> {
    return this.http.put<any>(`${this.urlEndPoint}/${libro.id}`, libro).pipe(
      catchError(e => {
        // Validamos
        if(e.status==400) {
          return throwError(e);
        }

        // Controlamos otros errores
        this.router.navigate(['/libros']);
        console.log(e.error.mensaje);
        swal(e.error.mensaje, e.error.error, 'error');
        return throwError(e);
      })
    );
  }

  // Delete
  delete(id: number): Observable<Libro> {
    return this.http.delete<Libro>(`${this.urlEndPoint}/${id}`).pipe(
      catchError(e => {
        console.error(e.error.mensaje);
        return throwError(e);
      })
    );
  }
}