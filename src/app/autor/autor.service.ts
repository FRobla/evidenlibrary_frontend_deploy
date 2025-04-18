import { Injectable, OnInit } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, tap, throwError, of } from 'rxjs';
import { Autor } from './autor';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import swal from 'sweetalert2';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'  //disponible a nivel global
})

export class AutorService implements OnInit {
  private urlEndPoint: string = 'https://evidenlibrary-backend.onrender.com/api/autores';
  private urlEndPoint1: string = 'https://evidenlibrary-backend.onrender.com/api/autor';

  // Creamos un BehaviorSubject para la lista de autores
  private autoresSubject = new BehaviorSubject<Autor[]>([]);
  autores$ = this.autoresSubject.asObservable();  // Observable al que nos suscribimos en los componentes

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {}

  // Obtener autores paginados
  getAutoresPaginados(page: number, size: number): Observable<any> {
    return this.http.get<any>(`${this.urlEndPoint}/page/${page}/size/${size}`).pipe(
      catchError(e => {
        console.error('Error en getAutoresPaginados:', e);
        // Retornar un objeto vacío con estructura similar a la paginación para evitar errores
        return of({
          content: [],
          number: 0,
          size: size,
          totalElements: 0,
          totalPages: 0,
          first: true,
          last: true
        });
      })
    );
  }

  // Obtener lista de autores
  getAutores(): Observable<Autor[]> {
    return this.http.get(this.urlEndPoint).pipe(
      map(response => {
        let autores = response as Autor[];
        return autores.map(autor => {
          autor.nombre = autor.nombre;
          autor.biografia = autor.biografia;
          return autor;
        });
      }),
      tap(autores => {
        // Al obtener la lista, actualizamos el BehaviorSubject
        this.autoresSubject.next(autores);
      })
    );
  }

  // Crear autor
  create(autor: Autor): Observable<any> {
    return this.http.post<any>(this.urlEndPoint1, autor).pipe(
      catchError(e => {
        if (e.status == 400) {
          return throwError(e);
        }

        this.router.navigate(['/autores']);
        console.log(e.error.mensaje);
        swal(e.error.mensaje, e.error.error, 'error');
        return throwError(e);
      })
    );
  }

  // Obtener autor individual
  getAutor(id: number): Observable<Autor> {
    return this.http.get<Autor>(`${this.urlEndPoint1}/${id}`).pipe(
      catchError(e => {
        this.router.navigate(['/autores']);
        console.log(e.error.mensaje);
        swal('Error al obtener el autor', e.error.mensaje, 'error');
        return throwError(e);
      })
    );
  }

  // Actualizar autor
  updateAutor(autor: Autor): Observable<any> {
    return this.http.put<any>(`${this.urlEndPoint1}/${autor.id}`, autor).pipe(
      catchError(e => {
        if (e.status == 400) {
          return throwError(e);
        }

        this.router.navigate(['/autores']);
        console.log(e.error.mensaje);
        swal(e.error.mensaje, e.error.error, 'error');
        return throwError(e);
      })
    );
  }

  // Eliminar autor
  delete(id: number): Observable<Autor> {
    return this.http.delete<Autor>(`${this.urlEndPoint1}/${id}`).pipe(
      catchError(e => {
        this.router.navigate(['/autores']);
        console.log(e.error.mensaje);
        swal(e.error.mensaje, e.error.error, 'error');
        return throwError(e);
      }),
      tap(() => {
        this.getAutores().subscribe();  // Refrescamos la lista
      })
    );
  }

  // Eliminar todos los autores
  deleteAll(): Observable<void> {
    return this.http.delete<void>(`${this.urlEndPoint}`);
  }
}
