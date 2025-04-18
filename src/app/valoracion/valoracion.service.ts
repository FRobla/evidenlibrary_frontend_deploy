import { HttpClient} from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, tap, throwError, of } from 'rxjs';
import { Valoracion } from './valoracion';
import { Router } from '@angular/router';
import swal from 'sweetalert2';
import { LibroService } from '../libro/libro.service';

@Injectable({
  providedIn: 'root'
})
export class ValoracionService implements OnInit {

  private urlEndPoint: string = 'https://evidenlibrary-backend.onrender.com/api/valoraciones';

  private urlEndPoint1: string = 'https://evidenlibrary-backend.onrender.com/api/valoracion';

  // Creamos un BehaviorSubject para la lista de valoraciones
  private valoracionesSubject = new BehaviorSubject<Valoracion[]>([]);
  valoraciones$ = this.valoracionesSubject.asObservable();  // Observable al que nos suscribimos en los componentes

  constructor(private http: HttpClient, private router: Router, private libroService: LibroService) {}

  ngOnInit(): void {}

  // Obtener valoraciones por ID de usuario
  getValoracionesPorUsuarioId(usuarioId: number): Observable<Valoracion[]> {
    return this.http.get<Valoracion[]>(`${this.urlEndPoint}/usuario/${usuarioId}`).pipe(
      catchError(e => {
        console.error(e.error.mensaje);
        return throwError(() => e);
      })
    );
  }

  // Obtener valoraciones paginadas
  getValoracionesPaginadas(page: number, size: number): Observable<any> {
    return this.http.get<any>(`${this.urlEndPoint}/page/${page}/size/${size}`).pipe(
      tap(response => {
        if (response && response.content) {
          (response.content as Valoracion[]).forEach(valoracion => {
            valoracion.fecha = new Date(valoracion.fecha);
          });
        }
      }),
      catchError(e => {
        console.error('Error en getValoracionesPaginadas:', e);
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

  getValoraciones(): Observable<Valoracion[]> {
    return this.http.get<any[]>(this.urlEndPoint).pipe(
      map(response => {
        return response.map(item => {
          const valoracion = new Valoracion();
          valoracion.id = item.id;
          valoracion.usuario = item.usuario;
          valoracion.libro = item.libro;
          if (item.libro) {
            valoracion.libro = {
              id: item.libro.id,
              titulo: item.libro.titulo,
              precio: item.libro.precio,
              stock: item.libro.stock,
              imagen: item.libro.imagen,
              descripcion: item.libro.descripcion,
              anio: item.libro.anio,
              valoraciones: item.libro.valoraciones || [],
              valoracionMedia: item.libro.valoracionMedia || 0,
              autores: item.libro.autores || [],
              generos: item.libro.generos || []
            };
          }
          valoracion.puntuacion = item.puntuacion;
          valoracion.comentario = item.comentario;
          valoracion.libroDetalles = item.libroDetalles;
          valoracion.fecha = new Date(item.fecha);

          //info del libro
          if(item.libroDetalles) {
            this.libroService.getLibro(item.libroDetalles).subscribe(
              libro => {
                valoracion.libro = libro;
              },
              error => {
                console.error('Error al obtener el libro:', error);
              }
            )
          }
          return valoracion;
        });
      })
    );
  }

  // Crear valoracion
  create(valoracion: Valoracion): Observable<any> {
    return this.http.post<any>(this.urlEndPoint1, valoracion).pipe(
      tap(response => {
        //Actualizar la lista de valoraciones
        this.getValoraciones().subscribe(valoraciones => {
          this.valoracionesSubject.next(valoraciones);
        });
      }),
      catchError(e => {
        if (e.status == 400) {
          return throwError(e);
        }

        this.router.navigate(['/valoraciones']);
        console.log(e.error.mensaje);
        swal(e.error.mensaje, e.error.error, 'error');
        return throwError(e);
      })
    );
  }

  // Obtener valoracion individual
  getValoracion(id: number): Observable<Valoracion> {
    return this.http.get<Valoracion>(`${this.urlEndPoint1}/${id}`).pipe(
      catchError(e => {
        this.router.navigate(['/valoraciones']);
        console.log(e.error.mensaje);
        swal('Error al obtener el valoracion', e.error.mensaje, 'error');
        return throwError(e);
      })
    );
  }

  // Actualizar valoracion
  updateValoracion(valoracion: Valoracion): Observable<any> {
    return this.http.put<any>(`${this.urlEndPoint1}/${valoracion.id}`, valoracion).pipe(
      tap(response => {
        //Actualizar la lista de valoraciones
        this.getValoraciones().subscribe(valoraciones => {
          this.valoracionesSubject.next(valoraciones);
        });
      }),
      catchError(e => {
        if (e.status == 400) {
          return throwError(e);
        }

        this.router.navigate(['/valoraciones']);
        console.log(e.error.mensaje);
        swal(e.error.mensaje, e.error.error, 'error');
        return throwError(e);
      })
    );
  }

  // Eliminar valoracion
  delete(id: number): Observable<Valoracion> {
    return this.http.delete<Valoracion>(`${this.urlEndPoint1}/${id}`).pipe(
      tap(response => {
        //Actualizar la lista de valoraciones
        this.getValoraciones().subscribe(valoraciones => {
          this.valoracionesSubject.next(valoraciones);
        });
      }),
      catchError(e => {
        this.router.navigate(['/valoraciones']);
        console.log(e.error.mensaje);
        swal(e.error.mensaje, e.error.error, 'error');
        return throwError(e);
      }),
      /* tap(() => {
        this.getValoraciones().subscribe();  // Refrescamos la lista
      }) */
    );
  }
}
