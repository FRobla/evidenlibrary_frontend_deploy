import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Libro } from '../libro/libro';
import { Router } from '@angular/router';
 
@Injectable({
  providedIn: 'root'  //disponible a nivel global
})
export class SearchService {
  private urlEndPoint: string = 'https://evidenlibrary-backend.onrender.com/api/search'; 

  constructor(private http: HttpClient, private router: Router) {}

  search(query: string, searchLibros: boolean = true, searchAutores: boolean = true, searchGeneros: boolean = true): Observable<any> {
    // Limpiar la query antes de enviarla
    const cleanQuery = query.replace(/\s+/g, ' ').trim();
   
    let params = new HttpParams()
      .set('query', cleanQuery)
      .set('searchLibros', searchLibros.toString())
      .set('searchAutores', searchAutores.toString())
      .set('searchGeneros', searchGeneros.toString());

    return this.http.get(this.urlEndPoint, { params });

  }
 
  getLibrosByAutor(autorId: number): Observable<Libro[]> {
    return this.http.get<Libro[]>(`${this.urlEndPoint}/libros/autor/${autorId}`);
  }
 
  getLibrosByGenero(generoId: number): Observable<Libro[]> {
    return this.http.get<Libro[]>(`${this.urlEndPoint}/libros/genero/${generoId}`);
  }
 
  getLibrosByAnio(anio: string): Observable<Libro[]> {
    return this.http.get<Libro[]>(`${this.urlEndPoint}/libros/anio/${anio}`);
  }
}