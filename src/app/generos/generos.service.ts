import { Injectable, OnInit } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, of, tap, throwError } from 'rxjs';
import { HttpClient} from '@angular/common/http';
import { Genero } from './generos';
import { Router } from '@angular/router';
import swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'  //disponible a nivel global
})
export class GeneroService implements OnInit{
  private urlEndPoint: string = 'https://evidenlibrary-backend.onrender.com/api/generos';
  private urlEndPoint1: string = 'https://evidenlibrary-backend.onrender.com/api/genero'; 

  // Creamos un BehaviorSubject para la lista de generoes
  private generoesSubject = new BehaviorSubject<Genero[]>([]);
  generoes$ = this.generoesSubject.asObservable();  // Observable al que nos suscribimos en los componentes
  
  // Cache para los géneros
  private generosCache: Genero[] = [];
  private cacheCargada: boolean = false;

  constructor(private http: HttpClient, private router: Router) {
    // Cargar la caché al iniciar el servicio
    this.cargarCache();
  }

  ngOnInit(): void {}
  
  // Método para cargar la caché
  private cargarCache(): void {
    console.log('Cargando caché de géneros...');
    this.http.get(this.urlEndPoint).pipe(
      map(response => {
        let generos = response as Genero[];
        return generos.map(genero => {
          genero.nombre = genero.nombre?.toUpperCase();
          genero.descripcion = genero.descripcion;
          return genero;
        });
      })
    ).subscribe({
      next: (generos) => {
        console.log('Caché de géneros cargada correctamente:', generos);
        this.generosCache = generos;
        this.cacheCargada = true;
        this.generoesSubject.next(generos); // Actualizamos el BehaviorSubject
      },
      error: (error) => {
        console.error('Error al cargar la caché de géneros:', error);
        this.cacheCargada = false;
      }
    });
  }

  getGeneros(): Observable<Genero[]> {
    console.log('Solicitando géneros...');
    
    // Si ya tenemos la caché cargada, devolvemos los datos de la caché
    if (this.cacheCargada && this.generosCache.length > 0) {
      console.log('Devolviendo géneros desde la caché:', this.generosCache);
      return of(this.generosCache);
    }
    
    // Si no hay caché o está vacía, hacemos la petición HTTP
    console.log('Caché no disponible, haciendo petición HTTP');
    return this.http.get(this.urlEndPoint).pipe(
      tap(response => console.log('Respuesta de la API de géneros:', response)),
      
      // Conversión a generos (response de Object a Genero[])
      map(response => {
        let generos = response as Genero[];

        return generos.map(genero => {
          genero.nombre = genero.nombre?.toUpperCase();
          genero.descripcion = genero.descripcion;

          return genero;
        });
      }),
      
      // Guardar en caché
      tap(generos => {
        console.log('Actualizando caché de géneros:', generos);
        this.generosCache = generos;
        this.cacheCargada = true;
        this.generoesSubject.next(generos); // Actualizamos el BehaviorSubject
      }),
      
      catchError(error => {
        console.error('Error obteniendo géneros:', error);
        return of([]);
      })
    );
  }

  // Crear genero
  create(genero: Genero): Observable<any> {
    return this.http.post<any>(this.urlEndPoint1, genero).pipe(
      catchError(e => {
        if (e.status == 400) {
          return throwError(e);
        }

        this.router.navigate(['/generos']);
        console.log(e.error.mensaje);
        swal(e.error.mensaje, e.error.error, 'error');
        return throwError(e);
      })
    );
  }

  // Obtener genero individual
  getGenero(id: number): Observable<Genero> {
    return this.http.get<Genero>(`${this.urlEndPoint1}/${id}`).pipe(
      catchError(e => {
        this.router.navigate(['/generos']);
        console.log(e.error.mensaje);
        swal('Error al obtener el genero', e.error.mensaje, 'error');
        return throwError(e);
      })
    );
  }

  // Actualizar genero
  updateGenero(genero: Genero): Observable<any> {
    return this.http.put<any>(`${this.urlEndPoint1}/${genero.id}`, genero).pipe(
      catchError(e => {
        if (e.status == 400) {
          return throwError(e);
        }

        this.router.navigate(['/generos']);
        console.log(e.error.mensaje);
        swal(e.error.mensaje, e.error.error, 'error');
        return throwError(e);
      })
    );
  }

  // Eliminar genero
  delete(id: number): Observable<Genero> {
    return this.http.delete<Genero>(`${this.urlEndPoint}/${id}`).pipe(
      catchError(e => {
        this.router.navigate(['/generos']);
        console.log(e.error.mensaje);
        swal(e.error.mensaje, e.error.error, 'error');
        return throwError(e);
      }),
      tap(() => {
        this.getGeneros().subscribe();  // Refrescamos la lista
      })
    );
  }

  // Eliminar todos los generoes
  deleteAll(): Observable<void> {
    return this.http.delete<void>(`${this.urlEndPoint}`);
  }
}