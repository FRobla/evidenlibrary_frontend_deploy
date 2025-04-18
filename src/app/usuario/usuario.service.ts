import { Injectable } from '@angular/core';
import { map, Observable, catchError, throwError } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Usuario } from './usuario';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'  //disponible a nivel global
})
export class UsuarioService {
  private urlEndPoint: string = 'https://evidenlibrary-backend.onrender.com/api/usuarios';
  private urlEndPoint1: string = 'https://evidenlibrary-backend.onrender.com/api/usuario/';

  constructor(private http: HttpClient, private router: Router) {}

  getUsuarios(): Observable<Usuario[]> {
    return this.http.get(this.urlEndPoint).pipe(
      // Conversión a usuarios (response de Object a Usuario[])
      map(response => {
        let usuarios = response as Usuario[];
        return usuarios.map(usuario => {
          usuario.nombre = usuario.nombre?.toUpperCase();
          usuario.apellido = usuario.apellido;
          usuario.email = usuario.email;
          usuario.direccion = usuario.direccion;
          usuario.password = usuario.password;
          usuario.rol = usuario.rol;
          return usuario;
        });
      }),
      catchError(e => {
        console.error('Error al obtener usuarios:', e);
        return throwError(() => e);
      })
    );
  }

  // Obtener un usuario por ID
  getUsuario(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.urlEndPoint1}${id}`).pipe(
      map(response => response as Usuario),
      catchError(e => {
        console.error('Error al obtener el usuario:', e);
        return throwError(() => e);
      })
    );
  }

  // Actualizar un usuario
  update(usuario: Usuario): Observable<any> {
    return this.http.put<any>(`${this.urlEndPoint1}${usuario.id}`, usuario).pipe(
      catchError(e => {
        console.error('Error al actualizar el usuario:', e);
        return throwError(() => e);
      })
    );
  }
}
