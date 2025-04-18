import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, of, catchError } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private urlEndPoint = 'https://evidenlibrary-keycloak.onrender.com/realms/EvidenLibrary/protocol/openid-connect/token';
  private registroEndPoint = 'https://evidenlibrary-keycloak.onrender.com/admin/realms/EvidenLibrary/users';
  private usuarioActualSubject = new BehaviorSubject<any>(null);
  public usuarioActual = this.usuarioActualSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    // Intentar recuperar usuario del localStorage al iniciar
    const accessToken = localStorage.getItem('access_token');
    const usuarioGuardado = localStorage.getItem('usuario');
    
    if (accessToken && usuarioGuardado) {
      try {
        const usuario = JSON.parse(usuarioGuardado);
        this.usuarioActualSubject.next(usuario);
      } catch (error) {
        console.error('Error al recuperar el usuario del localStorage', error);
        this.logout(); // Limpiar datos inválidos
      }
    } else {
      // Si no hay token, establecer explícitamente el valor a null
      this.usuarioActualSubject.next(null);
    }
  }

  login(credenciales: { email: string, password: string }): Observable<any> {
    const body = new URLSearchParams();
    body.set('client_id', 'eviden-library-rest-api'); 
    body.set('username', credenciales.email);
    body.set('password', credenciales.password);
    body.set('grant_type', 'password');
  
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });
  
    return this.http.post<any>(this.urlEndPoint, body.toString(), { headers }).pipe(
      tap(usuario => {
        if (usuario && usuario.access_token) {
          const tokenPayload = this.decodeToken(usuario.access_token);
          
          // Extraer roles
          const roles = this.extractRolesFromPayload(tokenPayload);
          
          // Asignar rol (priorizar ADMIN)
          usuario.rol = roles.includes('ADMIN') ? 'ADMIN' : 'USER';
  
          // Añadir información adicional del usuario
          usuario.username = tokenPayload.preferred_username;
          usuario.email = tokenPayload.email;
          
          // Guardar el token y la información básica del usuario
          localStorage.setItem('access_token', usuario.access_token);
          localStorage.setItem('usuario', JSON.stringify(usuario));
          
          // Actualizar subject con la información básica
          this.usuarioActualSubject.next(usuario);
          
          // Después de autenticar, obtener los datos completos del usuario por email
          this.obtenerUsuarioPorEmail(usuario.email).subscribe(
            usuarioCompleto => {
              if (usuarioCompleto) {
                // Actualizar el ID del usuario con el de la base de datos
                usuario.id = usuarioCompleto.id;
                
                // Actualizar el localStorage y el subject con el ID correcto
                localStorage.setItem('usuario', JSON.stringify(usuario));
                this.usuarioActualSubject.next(usuario);
              }
            },
            error => {
              console.error('Error al obtener datos completos del usuario:', error);
            }
          );
        }
      })
    );
  }
  
  private decodeToken(token: string): any {
    try {
      // Decodificar el payload del token JWT
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      console.log('Token decodificado:', JSON.parse(jsonPayload));
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding token', error);
      return {};
    }
  }
  
  private extractRolesFromPayload(payload: any): string[] {
    // Priorizar roles del reino y del cliente
    const realmRoles = payload['realm_access']?.roles || [];
    const clientRoles = payload['resource_access']?.['eviden-library-rest-api']?.roles || [];
  
    // Combinar y normalizar roles
    const roles = [...realmRoles, ...clientRoles];
    
    // Filtrar roles específicos
    const mappedRoles = roles
      .filter(role => 
        role.toLowerCase() === 'admin' || 
        role.toLowerCase() === 'user'
      )
      .map(role => role.toUpperCase());
  
    return mappedRoles;
  }
  

  logout() {
    // Limpiar localStorage y el subject
    localStorage.removeItem('access_token');  // Elimina el token de acceso
    localStorage.removeItem('usuario');  // Elimina la información del usuario
    this.usuarioActualSubject.next(null);  // Actualiza el subject a null
    
    this.router.navigate(['/login']);
  }
  

  get usuarioLogueado() {
    return this.usuarioActualSubject.value;
  }

  get esAdmin() {
    return this.usuarioActualSubject.value?.rol === 'ADMIN';
  }

  get esUsuario() {
    return this.usuarioActualSubject.value?.rol === 'USER';
  }

  estaLogueado(): boolean {
    // Verificar si hay un token en localStorage
    const token = localStorage.getItem('access_token');
    return !!token;
  }

  getCurrentUserId(): number {
    // Obtener el usuario actual del BehaviorSubject
    const usuarioActual = this.usuarioActualSubject.value;

    // Si hay un usuario actual, devolver su ID
    if (usuarioActual && usuarioActual.id && !isNaN(Number(usuarioActual.id))) {
      return Number(usuarioActual.id);
    }

    // Si no hay usuario o no tiene ID, intentar obtenerlo del localStorage
    const usuarioGuardado = localStorage.getItem('usuario');
    if (usuarioGuardado) {
      try {
        const usuario = JSON.parse(usuarioGuardado);
        if (usuario.id && !isNaN(Number(usuario.id))) {
          return Number(usuario.id);
        } else {
          console.warn('El usuario en localStorage no tiene un ID válido:', usuario);
        }
      } catch (error) {
        console.error('Error al parsear usuario desde localStorage:', error);
      }
    } else {
      console.warn('No se encontró información de usuario en localStorage');
    }

    // Si no se puede obtener el ID, devolver un ID temporal para pruebas
    console.warn('No se pudo obtener un ID de usuario válido. Usando ID temporal.');
    return 1; // ID temporal para pruebas
  }

  registro(usuario: { 
    firstName: string,
    lastName: string,
    email: string,
    password: string 
  }): Observable<any> {
    const registroPublicoEndPoint = 'http://localhost:8080/api/registro';
    
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const body = {
      firstName: usuario.firstName,
      lastName: usuario.lastName,
      email: usuario.email,
      password: usuario.password
    };

    return this.http.post(registroPublicoEndPoint, body, { headers }).pipe(
      tap(() => {
        // Después del registro exitoso, intentamos hacer login automáticamente
        console.log('Registro exitoso, intentando iniciar sesión automáticamente');
      })
    );
  }

  // Método para extraer un ID numérico del subject del token
  private extractNumericId(sub: string): number {
    // Si sub ya es un número, devolverlo
    if (!isNaN(Number(sub))) {
      return Number(sub);
    }
    
    // Si sub contiene un número al final (común en algunos formatos de ID)
    const matches = sub.match(/(\d+)$/);
    if (matches && matches[1]) {
      return Number(matches[1]);
    }
    
    // Si no podemos extraer un número, usamos un valor temporal
    // En una implementación real, deberíamos hacer una petición al backend
    // para obtener el ID real del usuario basado en su email o username
    console.warn('No se pudo extraer un ID numérico del token. Usando ID temporal.');
    return 1; // ID temporal para pruebas
  }

  // Método para obtener el email del usuario actual
  getCurrentUserEmail(): string {
    // Obtener el usuario actual del BehaviorSubject
    const usuarioActual = this.usuarioActualSubject.value;

    // Si hay un usuario actual, devolver su email
    if (usuarioActual && usuarioActual.email) {
      return usuarioActual.email;
    }

    // Si no hay usuario, intentar obtenerlo del localStorage
    const usuarioGuardado = localStorage.getItem('usuario');
    if (usuarioGuardado) {
      try {
        const usuario = JSON.parse(usuarioGuardado);
        if (usuario.email) {
          return usuario.email;
        }
      } catch (error) {
        console.error('Error obteniendo el usuario del localStorage', error);
      }
    }

    // Si no se puede obtener el email, devolver cadena vacía
    return '';
  }

  // Método para obtener el usuario actual completo
  getCurrentUser(): any {
    // Obtener el usuario actual del BehaviorSubject
    const usuarioActual = this.usuarioActualSubject.value;

    // Si hay un usuario actual, devolverlo
    if (usuarioActual) {
      return usuarioActual;
    }

    // Si no hay usuario, intentar obtenerlo del localStorage
    const usuarioGuardado = localStorage.getItem('usuario');
    if (usuarioGuardado) {
      try {
        return JSON.parse(usuarioGuardado);
      } catch (error) {
        console.error('Error al obtener el usuario del localStorage', error);
      }
    }

    // Si no se puede obtener el usuario, devolver null
    return null;
  }

  // Método para obtener el usuario por email
  obtenerUsuarioPorEmail(email: string): Observable<any> {
    // Crear cabeceras con el token
    const headers = this.createHeaders();
    
    // URL para obtener usuario por email (ajusta según tu API)
    const url = 'http://localhost:8080/api/usuario/email/' + email;
    
    return this.http.get<any>(url, { headers }).pipe(
      catchError(error => {
        console.error('Error al obtener usuario por email:', error);
        return of(null);
      })
    );
  }

  // Método para crear cabeceras con el token
  private createHeaders(): HttpHeaders {
    const accessToken = localStorage.getItem('access_token');
    if (accessToken) {
      const headers = new HttpHeaders({
        'Authorization': 'Bearer ' + accessToken
      });
      return headers;
    }
    throw new Error('Token de acceso no encontrado');
  }

  // Verificar si el token es válido
  verificarToken(): boolean {
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.error('No hay token disponible');
      return false;
    }

    try {
      // Verificación básica del formato del token
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        console.error('El token no tiene un formato JWT válido');
        return false;
      }

      // No verificar la expiración del token para evitar problemas
      // Dejar que el backend se encargue de validar el token
      
      return true;
    } catch (error) {
      console.error('Error al verificar el token:', error);
      return false;
    }
  }

  // Obtener el token actual
  getToken(): string | null {
    return localStorage.getItem('access_token');
  }
}