import { Injectable } from '@angular/core';
import { catchError, map, Observable, tap, throwError, of } from 'rxjs';
import { Libro } from './libro';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import swal from 'sweetalert2';
import { Autor } from '../autor/autor';

@Injectable({
  providedIn: 'root'  //disponible a nivel global
})
export class LibroService {
  private urlEndPoint: string = 'https://evidenlibrary-backend.onrender.com/api/libros';
  private urlEndPoint1: string = 'https://evidenlibrary-backend.onrender.com/api/libro';
  private urlAutores: string = 'https://evidenlibrary-backend.onrender.com/api/autores'; 

  constructor(private http: HttpClient, private router: Router) {}

  //Get mejor valorados
  getMejorValorados(): Observable<Libro[]> {
    return this.http.get<Libro[]>(this.urlEndPoint+ '/mejor-valorados');  
  }

  // Get libros (paginado)
  getLibros(page: number): Observable<any> {
    return this.http.get(this.urlEndPoint + '/page/' + page).pipe(

      /*
      tap((response: any) => {
        console.log('LibroService: tap 1 (Object)');
        (response.content as Libro[]).forEach(libro => {
          console.log(libro.titulo);
        })
      }), */

      map((response: any) => {
        // Retornamos
        (response.content as Libro[]).map(libro => {
          libro.titulo = libro.titulo;
          libro.precio = libro.precio;
          libro.stock = libro.stock;
          libro.descripcion = libro.descripcion;

          //let datePipe = new DatePipe('es');
          //libro.createAt = libro.createAt ? datePipe.transform(libro.createAt, 'EEEE dd, MMM yyyy') ?? '11-12-2001' : '11-12-2001';
         
          return libro;
        });
        return response;
      }),
    );
  }

  // Get libros (paginado con tamaño personalizado)
  getLibrosConTamanio(page: number, size: number): Observable<any> {
    return this.http.get(`${this.urlEndPoint}/page/${page}/size/${size}`).pipe(
      map((response: any) => {
        // Retornamos
        (response.content as Libro[]).map(libro => {
          libro.titulo = libro.titulo;
          libro.precio = libro.precio;
          libro.stock = libro.stock;
          libro.descripcion = libro.descripcion;
         
          return libro;
        });
        return response;
      }),
      catchError(e => {
        console.error('Error al cargar libros paginados:', e);
        // Devolver un objeto vacío con la estructura esperada para evitar errores
        return of({
          content: [],
          totalPages: 0,
          totalElements: 0,
          size: size,
          number: page
        });
      })
    );
  }

  /* Sin paginacion */

  // Observable para que sea asíncrono (se actualice en tiempo real)
  getLibrosNoPagin(): Observable<Libro[]> {

    // return of(LIBROS);

    return this.http.get(this.urlEndPoint).pipe(

      // Conversión a libros (response de Object a Libro[])
      map(response => {
        let libros = response as Libro[];

        return libros.map(libro => {
          libro.titulo = libro.titulo?.toUpperCase();
          libro.precio = libro.precio;
          libro.stock = libro.stock;
          libro.descripcion = libro.descripcion;
         
          return libro;
        });
      }),

    );
  }

  // Crear libro
  create(libro: Libro) : Observable<any> {
    return this.http.post<any>(this.urlEndPoint1, libro).pipe(
      catchError(e => {
        // Validamos
        if(e.status==400) {
          return throwError(() => e);
        }

        // Controlamos otros errores
        this.router.navigate(['/libros']);
        console.log(e.error.mensaje);
        swal(e.error.mensaje, e.error.error, 'error');
        return throwError(() => e);
      })
    );
  }

  // Obtener
  getLibro(id: number): Observable<Libro> {
    // pipe para canalizar errores
    return this.http.get<Libro>(`${this.urlEndPoint1}/${id}`).pipe(
      catchError(e => {
        this.router.navigate(['/libros']);
        console.log(e.error.mensaje);
        swal('Error al obtener el libro', e.error.mensaje, 'error');
        return throwError(() => e);
      })
    );
  }

  // Update
  updateLibro(libro: Libro): Observable<any> {
    return this.http.put<any>(`${this.urlEndPoint1}/${libro.id}`, libro).pipe(
      catchError(e => {
        // Validamos
        if(e.status==400) {
          return throwError(() => e);
        }

        // Controlamos otros errores
        this.router.navigate(['/libros']);
        console.log(e.error.mensaje);
        swal(e.error.mensaje, e.error.error, 'error');
        return throwError(() => e);
      })
    );
  }

  // Delete
  delete(id: number): Observable<Libro> {
    return this.http.delete<Libro>(`${this.urlEndPoint1}/${id}`).pipe(
      catchError(e => {
        this.router.navigate(['/libros']);
        console.log(e.error.mensaje);
        swal(e.error.mensaje, e.error.error, 'error');
        return throwError(() => e);
      })
    );
  }

  // Delete todos
  deleteAll(): Observable<void> {
    return this.http.delete<void>(`${this.urlEndPoint}`);
  }

  //Obtener autores para el filtro
  getAutores(): Observable<Autor[]> {
    return this.http.get<Autor[]>(this.urlAutores).pipe(
      catchError(e => {
        console.error('Error al cargar autores:', e);
        // Devolver un array vacío para evitar errores
        return of([]);
      })
    );
  }

  // Obtener libros filtrados por autor
  getLibrosPorAutor(page: number, size: number, autorId: number): Observable<any> {
    return this.http.get(`${this.urlEndPoint}/autor/${autorId}/page/${page}/size/${size}`).pipe(
      map((response: any) => {
        (response.content as Libro[]).map(libro => {
          libro.titulo = libro.titulo;
          libro.precio = libro.precio;
          libro.stock = libro.stock;
          libro.descripcion = libro.descripcion;
         
          return libro;
        });
        return response;
      }),
      catchError(e => {
        console.error('Error al cargar libros por autor:', e);
        // Si hay un error, intentar obtener todos los libros y filtrar por autor en el cliente
        return this.getLibrosNoPagin().pipe(
          map(libros => {
            // Filtrar libros por autor
            const librosFiltrados = libros.filter(libro =>
              libro.autores && libro.autores.some(autor => autor.id === autorId)
            );
           
            // Crear un objeto con la misma estructura que la respuesta paginada
            return {
              content: librosFiltrados.slice(page * size, (page + 1) * size),
              totalElements: librosFiltrados.length,
              totalPages: Math.ceil(librosFiltrados.length / size),
              size: size,
              number: page
            };
          }),
          catchError(err => {
            console.error('Error al cargar y filtrar libros por autor en el cliente:', err);
            // Si todo falla, devolver un objeto vacío
            return of({
              content: [],
              totalPages: 0,
              totalElements: 0,
              size: size,
              number: page
            });
          })
        );
      })
    );
  }

  // Obtener libros filtrados por género
  getLibrosPorGenero(generoId: number, page: number, size: number): Observable<any> {
    // Asegurarse de que page y size sean números válidos
    page = Math.max(0, page);
    size = Math.max(1, size);

    const url = `${this.urlEndPoint}/genero/${generoId}/page/${page}/size/${size}`;
    console.log('Llamando a API para obtener libros por género:', url);
    console.log('Parámetros:', { generoId, page, size });

    return this.http.get(url)
      .pipe(
        tap(response => console.log('Respuesta de API (libros por género):', response)),
        map((response: any) => {
          // Procesar los libros de la respuesta
          if (response.content) {
            response.content = (response.content as Libro[]).map(libro => {
              libro.titulo = libro.titulo;
              libro.precio = libro.precio;
              libro.stock = libro.stock;
              libro.descripcion = libro.descripcion;
              return libro;
            });
          }

          // Asegurarse de que la respuesta tenga la estructura correcta
          return {
            content: response.content || [],
            totalElements: response.totalElements || 0,
            totalPages: response.totalPages || 0,
            size: size,
            number: page
          };
        }),
        catchError(e => {
          console.error('Error al cargar libros por género:', e);
          console.log('Intentando fallback en el cliente...');
          // Si hay un error, intentar obtener todos los libros y filtrar por género en el cliente
          return this.getLibrosNoPagin().pipe(
            map(libros => {
              console.log('Filtrando libros por género en el cliente. Total libros:', libros.length);
              // Filtrar libros por género
              const librosFiltrados = libros.filter(libro =>
                libro.generos && libro.generos.some(genero => genero.id === generoId)
              );
              console.log('Libros filtrados por género:', librosFiltrados.length);
             
              // Calcular el total de páginas
              const totalPages = Math.ceil(librosFiltrados.length / size);
             
              // Asegurarse de que la página solicitada no exceda el total de páginas
              const validPage = Math.min(page, totalPages - 1);
             
              // Obtener los libros para la página actual
              const startIndex = validPage * size;
              const endIndex = startIndex + size;
              const librosPagina = librosFiltrados.slice(startIndex, endIndex);
             
              // Crear un objeto con la misma estructura que la respuesta paginada
              return {
                content: librosPagina,
                totalElements: librosFiltrados.length,
                totalPages: totalPages,
                size: size,
                number: validPage
              };
            }),
            catchError(err => {
              console.error('Error al cargar y filtrar libros por género en el cliente:', err);
              return of({
                content: [],
                totalPages: 0,
                totalElements: 0,
                size: size,
                number: page
              });
            })
          );
        })
      );
  }
 
  // Obtener libros filtrados por autor y género
  getLibrosPorAutorYGenero(page: number, size: number, autorId: number, generoId: number): Observable<any> {
    // Asegurarse de que page y size sean números válidos
    page = Math.max(0, page);
    size = Math.max(1, size);

    return this.http.get(`${this.urlEndPoint}/autor/${autorId}/genero/${generoId}/page/${page}/size/${size}`)
      .pipe(
        map((response: any) => {
          // Procesar los libros de la respuesta
          if (response.content) {
            response.content = (response.content as Libro[]).map(libro => {
              libro.titulo = libro.titulo;
              libro.precio = libro.precio;
              libro.stock = libro.stock;
              libro.descripcion = libro.descripcion;
              return libro;
            });
          }

          // Asegurarse de que la respuesta tenga la estructura correcta
          return {
            content: response.content || [],
            totalElements: response.totalElements || 0,
            totalPages: response.totalPages || 0,
            size: size,
            number: page
          };
        }),
        catchError(e => {
          console.error('Error al cargar libros por autor y género:', e);
          // Si hay un error, intentar obtener todos los libros y filtrar en el cliente
          return this.getLibrosNoPagin().pipe(
            map(libros => {
              // Filtrar libros por autor y género
              const librosFiltrados = libros.filter(libro =>
                libro.autores && libro.autores.some(autor => autor.id === autorId) &&
                libro.generos && libro.generos.some(genero => genero.id === generoId)
              );
             
              // Calcular el total de páginas
              const totalPages = Math.ceil(librosFiltrados.length / size);
             
              // Asegurarse de que la página solicitada no exceda el total de páginas
              const validPage = Math.min(page, totalPages - 1);
             
              // Obtener los libros para la página actual
              const startIndex = validPage * size;
              const endIndex = startIndex + size;
              const librosPagina = librosFiltrados.slice(startIndex, endIndex);
             
              // Crear un objeto con la misma estructura que la respuesta paginada
              return {
                content: librosPagina,
                totalElements: librosFiltrados.length,
                totalPages: totalPages,
                size: size,
                number: validPage
              };
            }),
            catchError(err => {
              console.error('Error al cargar y filtrar libros por autor y género en el cliente:', err);
              return of({
                content: [],
                totalPages: 0,
                totalElements: 0,
                size: size,
                number: page
              });
            })
          );
        })
      );
  }
}