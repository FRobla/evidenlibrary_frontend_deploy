import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, throwError, of, switchMap } from 'rxjs';
import { Favorito } from './favorito';
import { Router } from '@angular/router';
import { Usuario } from '../usuario/usuario';
import { Libro } from '../libro/libro';
import { AuthService } from '../login/auth.service';

@Injectable({
  providedIn: 'root'
})
export class FavoritoService {

  private urlEndPoint = "https://evidenlibrary-backend.onrender.com/api/favoritos"
  private urlFavoritoEndPoint = "https://evidenlibrary-backend.onrender.com/api/favorito"

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService,
  ) {}

  getUsuarios(): Observable<Favorito[]> {
    return this.http.get(this.urlEndPoint).pipe(
      map((response) => {
        const favoritos = response as Favorito[]
        return favoritos.map((favorito) => {
          favorito.usuario = favorito.usuario
          favorito.libro = favorito.libro
          favorito.fechaAgregado = favorito.fechaAgregado
          return favorito
        })
      }),
    )
  }

  // Obtener favoritos por ID de usuario
  getFavoritosByUsuarioId(usuarioId: number): Observable<Favorito[]> {
    if (!usuarioId) {
      console.error("Intento de obtener favoritos sin ID de usuario")
      return of([]) // Devolver array vacío
    }

    return this.http.get<any>(`${this.urlFavoritoEndPoint}/usuario/${usuarioId}`).pipe(
      map((response) => {
        if (Array.isArray(response)) {
          return response.map((item) => {
            const favorito = new Favorito()
            favorito.id = item.id
            favorito.usuario = item.usuario
            favorito.libro = item.libro
            favorito.fechaAgregado = item.fechaAgregado
            return favorito
          })
        } else if (response && response.mensaje && response.mensaje.includes("no tiene favoritos")) {
          console.log("Usuario sin favoritos")
          return []
        } else {
          console.warn("La respuesta no es un array:", response)
          return []
        }
      }),
      catchError((error) => {
        console.error(`Error al obtener favoritos del usuario ${usuarioId}:`, error)
        if (error.status === 404) {
          console.log("Usuario sin favoritos (404)")
          return of([])
        }
        return throwError(() => error)
      }),
    )
  }

  // Agregar un libro a favoritos
  addFavorito(libro: Libro): Observable<any> {
    // Verificar si el token es válido
    if (!this.authService.verificarToken()) {
      console.error("Token inválido o expirado")
      return throwError("Token inválido o expirado")
    }

    // Obtener el ID del usuario actual usando el AuthService
    const usuarioId = this.authService.getCurrentUserId()
    if (!usuarioId) {
      console.error("No se pudo obtener el ID del usuario")
      return throwError("ID de usuario no disponible")
    }

    // Crear objeto favorito en el formato exacto que espera el backend
    const favoritoCompleto = new Favorito()
    favoritoCompleto.usuario = new Usuario()
    favoritoCompleto.usuario.id = usuarioId
    favoritoCompleto.libro = libro
    favoritoCompleto.fechaAgregado = new Date().toISOString()

    return this.http
      .post(`${this.urlFavoritoEndPoint}`, favoritoCompleto, {
        observe: "response",
      })
      .pipe(
        map((response) => {
          return response.body
        }),
        catchError((error) => {
          console.error("Error al agregar favorito:", error)
          console.error("Detalles del error:", {
            status: error.status,
            statusText: error.statusText,
            message: error.message,
            error: error.error,
          })
          return throwError(error)
        }),
      )
  }

  // Verificar si un libro está en favoritos
  checkFavorito(libroId: number): Observable<boolean> {
    // Obtener el usuario del localStorage
    const usuarioString = localStorage.getItem("usuario")
    if (!usuarioString) {
      console.error("No se encontró información del usuario en localStorage")
      return of(false) // Asumir que no es favorito
    }

    try {
      const usuarioData = JSON.parse(usuarioString)
      const usuarioId = usuarioData.id

      if (!usuarioId) {
        console.error("ID de usuario no encontrado en localStorage")
        return of(false) // Asumir que no es favorito
      }

      // Intentar con el endpoint específico
      return this.http.get<boolean>(`${this.urlEndPoint}/check/${usuarioId}/${libroId}`).pipe(
        map((response) => {
          return response
        }),
        catchError((error) => {
          console.error("Error al verificar favorito:", error)
          console.error("Detalles del error:", {
            status: error.status,
            statusText: error.statusText,
            message: error.message,
            error: error.error,
          })

          // Si el endpoint no existe o hay un error de permisos, obtener todos los favoritos y verificar manualmente
          console.log("Endpoint de verificación no disponible, obteniendo todos los favoritos")

          // Alternativa: obtener todos los favoritos del usuario y verificar manualmente
          return this.getFavoritosByUsuarioId(usuarioId).pipe(
            map((favoritos) => {
              const esFavorito = favoritos.some((f) => f.libro?.id === libroId)
              console.log(`El libro ${libroId} ${esFavorito ? "es" : "no es"} favorito del usuario ${usuarioId}`)
              return esFavorito
            }),
            catchError((err) => {
              console.error("Error en la verificación alternativa:", err)
              return of(false) // Asumir que no es favorito en caso de error
            }),
          )
        }),
      )
    } catch (error) {
      console.error("Error al procesar la información del usuario:", error)
      return of(false) // Asumir que no es favorito
    }
  }

  // Eliminar un favorito //
  delete(favorito: Favorito): Observable<any> {
    if (!favorito || !favorito.id) {
      console.error("Intento de eliminar un favorito sin ID")
      return throwError("No se puede eliminar un favorito sin ID")
    }

    console.log(`Eliminando favorito con ID: ${favorito.id}`)

    return this.http
      .delete(`${this.urlFavoritoEndPoint}/${favorito.id}`, {
        observe: "response",
      })
      .pipe(
        map((response) => {
          return response.body
        }),
        catchError((error) => {
          console.error(`Error al eliminar favorito con ID ${favorito.id}:`, error)
          console.error("Detalles del error:", {
            status: error.status,
            statusText: error.statusText,
            message: error.message,
            error: error.error,
          })
          return throwError(error)
        }),
      )
  }

  // Eliminar favorito por libro y usuario
  deleteFavoritoByLibroAndUsuario(libroId: number, usuarioId: number): Observable<any> {
    if (!libroId || !usuarioId) {
      console.error("Intento de eliminar favorito sin libroId o usuarioId")
      return throwError(() => "No se puede eliminar un favorito sin libroId o usuarioId")
    }

    console.log(`Buscando y eliminando favorito para libro ${libroId} y usuario ${usuarioId}`)

    // Primero obtenemos todos los favoritos del usuario
    return this.getFavoritosByUsuarioId(usuarioId).pipe(
      map((favoritos) => {
        // Buscamos el favorito que coincida con el libro
        const favoritoEncontrado = favoritos.find((f) => f.libro?.id === libroId)

        if (!favoritoEncontrado || !favoritoEncontrado.id) {
          throw new Error("No se encontró el favorito para eliminar")
        }

        console.log(`Favorito encontrado con ID: ${favoritoEncontrado.id}`)

        // Usamos el método delete existente que funciona
        return this.delete(favoritoEncontrado)
      }),
      // Aplanamos el Observable anidado
      switchMap((observable) => observable),
      catchError((error) => {
        console.error(`Error al eliminar favorito para libro ${libroId} y usuario ${usuarioId}:`, error)
        return throwError(() => error)
      }),
    )
  }
}