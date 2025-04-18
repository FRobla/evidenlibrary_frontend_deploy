import { HttpClient} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, catchError, throwError, of } from 'rxjs';
import { Pedido } from './pedido';
import { Usuario } from '../usuario/usuario';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class PedidoService {

  private urlEndPoint: string = 'https://evidenlibrary-backend.onrender.com/api/pedidos';
  private urlEndPointPedido: string = 'https://evidenlibrary-backend.onrender.com/api/pedido';
  private urlEndPointDetallePedido: string = 'https://evidenlibrary-backend.onrender.com/api/detalle-pedido';
 
    constructor(private http: HttpClient, private router: Router) {}

    // Método para crear un nuevo pedido
    createPedido(pedido: any): Observable<Pedido> {
      // Asegurarnos de que el pedido tiene todos los campos necesarios
      if (!pedido.usuario || !pedido.usuario.id) {
        console.error('Error: El pedido no tiene un usuario asociado');
        return throwError(() => new Error('El pedido no tiene un usuario asociado'));
      }
     
      if (!pedido.fechaPedido) {
        console.error('Error: El pedido no tiene una fecha');
        return throwError(() => new Error('El pedido no tiene una fecha'));
      }
     
      if (!pedido.estado) {
        console.error('Error: El pedido no tiene un estado');
        return throwError(() => new Error('El pedido no tiene un estado'));
      }
     
      if (!pedido.total) {
        console.error('Error: El pedido no tiene un total');
        return throwError(() => new Error('El pedido no tiene un total'));
      }
     
      if (!pedido.direccionEnvio) {
        console.error('Error: El pedido no tiene una dirección de envío');
        return throwError(() => new Error('El pedido no tiene una dirección de envío'));
      }
     
      return this.http.post<any>(`${this.urlEndPointPedido}`, pedido).pipe(
        map(response => {
          console.log('Respuesta del servidor al crear pedido:', response);
          if (response && response.pedido) {
            return response.pedido;
          } else if (response && response.id) {
            return response;
          } else if (response) {
            console.log('Respuesta del servidor sin estructura esperada:', response);
            return response;
          } else {
            console.error('Respuesta vacía del servidor');
            throw new Error('Respuesta vacía del servidor');
          }
        }),
        catchError(error => {
          console.error('Error al crear el pedido:', error);
          if (error.error && error.error.mensaje) {
            console.error('Mensaje de error del servidor:', error.error.mensaje);
          }
         
          // Si el error es por formato de fecha, intentar con otro formato
          if (error.error && error.error.includes && error.error.includes('Cannot deserialize value of type `java.util.Date`')) {
            console.log('Error de formato de fecha, intentando con otro formato...');
           
            // Convertir la fecha al formato esperado por el backend
            const fechaPedido = pedido.fechaPedido;
            if (typeof fechaPedido === 'string' && fechaPedido.includes('-')) {
              // Convertir de YYYY-MM-DD a DD/MM/YYYY
              const partes = fechaPedido.split('-');
              if (partes.length === 3) {
                pedido.fechaPedido = `${partes[2]}/${partes[1]}/${partes[0]}`;
                return this.createPedido(pedido);
              }
            }
          }
         
          return throwError(() => error);
        })
      );
    }

    getPedidosPorUsuarioId(usuarioId: number): Observable<Pedido[]> {
      const url = `${this.urlEndPoint}/usuario/${usuarioId}`;
     
      return this.http.get<any[]>(url).pipe(
        map(response => {
          // Comprobar si es null
          if (!response) {
            console.warn('La respuesta del servidor es nula o indefinida');
            return [];
          }
         
          // Asegurar que es un array
          if (!Array.isArray(response)) {
            // Si es un objeto, hazlo array
            if (response && typeof response === 'object') {
              response = [response];
            } else {
              return [];
            }
          }
         
          return response.map(item => {
            const pedido = new Pedido();
            pedido.id = item.id;
            pedido.fechaPedido = item.fechaPedido;
            pedido.estado = item.estado;
            pedido.total = item.total;
            pedido.precioTotal = item.precioTotal;
            pedido.direccionEnvio = item.direccionEnvio;
           
            if (item.usuario) {
              const usuario = new Usuario();
              usuario.id = item.usuario.id;
              usuario.nombre = item.usuario.nombre;
              usuario.apellido = item.usuario.apellido;
              usuario.direccion = item.usuario.direccion;
              usuario.email = item.usuario.email;
              usuario.password = '';
              usuario.rol = item.usuario.rol;
              pedido.usuario = usuario;
            }
           
            // Verificar explícitamente si hay detalles antes de mapear
            if (item.detalles && Array.isArray(item.detalles) && item.detalles.length > 0) {
              pedido.detalles = item.detalles.map((detalle: any) => ({
                id: detalle.id,
                libro: detalle.libro,
                cantidad: detalle.cantidad,
                precioUnitario: detalle.precioUnitario
              }));
            } else {
              console.warn(`No se encontraron detalles para el pedido ID: ${item.id}`);
              pedido.detalles = [];
            }
           
            return pedido;
          });
        }),
        catchError(error => {
          console.error('Error al obtener los pedidos del usuario:', error);
          return of([]); // Retornar array vacio en vez de error
        })
      );
    }
 
    getPedidos(): Observable<Pedido[]> {
      return this.http.get<any[]>(this.urlEndPoint).pipe(
        map(response => {
          if (!response) {
            console.warn('La respuesta del servidor es nula o indefinida');
            return [];
          }
         
          if (!Array.isArray(response)) {
            if (response && typeof response === 'object') {
              response = [response];
            } else {
              return [];
            }
          }
         
          return response.map(item => {
            const pedido = new Pedido();
            pedido.id = item.id;
            pedido.fechaPedido = item.fechaPedido;
            pedido.estado = item.estado;
            pedido.total = item.total;
            pedido.precioTotal = item.precioTotal;
            pedido.direccionEnvio = item.direccionEnvio;
            if (item.usuario) {
              const usuario = new Usuario();
              usuario.id = item.usuario.id;
              usuario.nombre = item.usuario.nombre;
              usuario.apellido = item.usuario.apellido;
              usuario.direccion = item.usuario.direccion;
              usuario.email = item.usuario.email;
              usuario.password = '';
              usuario.rol = item.usuario.rol;
              pedido.usuario = usuario;
            }
       
            // Verificar explícitamente si hay detalles antes de mapear
            if (item.detalles && Array.isArray(item.detalles) && item.detalles.length > 0) {
              pedido.detalles = item.detalles.map((detalle: any) => ({
                id: detalle.id,
                libro: detalle.libro,
                cantidad: detalle.cantidad,
                precioUnitario: detalle.precioUnitario
              }));
            } else {
              console.warn(`No se encontraron detalles para el pedido ID: ${item.id}`);
              pedido.detalles = [];
            }
           
            return pedido;
          });
        }),
        catchError(error => {
          console.error('Error al obtener todos los pedidos:', error);
          return of([]);
        })
      );
    }

    // Método para obtener un pedido por su ID
    getPedidoPorId(pedidoId: number): Observable<Pedido> {
      const url = `${this.urlEndPointPedido}/${pedidoId}`;
     
      return this.http.get<any>(url).pipe(
        map(response => {
          if (!response) {
            console.warn('La respuesta del servidor es nula o indefinida');
            throw new Error('No se encontró el pedido');
          }
         
          const pedido = new Pedido();
          pedido.id = response.id;
          pedido.fechaPedido = response.fechaPedido;
          pedido.estado = response.estado;
          pedido.total = response.total;
          pedido.precioTotal = response.precioTotal;
          pedido.direccionEnvio = response.direccionEnvio;
         
          if (response.usuario) {
            const usuario = new Usuario();
            usuario.id = response.usuario.id;
            usuario.nombre = response.usuario.nombre;
            usuario.apellido = response.usuario.apellido;
            usuario.direccion = response.usuario.direccion;
            usuario.email = response.usuario.email;
            usuario.password = '';
            usuario.rol = response.usuario.rol;
            pedido.usuario = usuario;
          }
         
          // Verificar explícitamente si hay detalles antes de mapear
          if (response.detalles && Array.isArray(response.detalles) && response.detalles.length > 0) {
            pedido.detalles = response.detalles.map((detalle: any) => ({
              id: detalle.id,
              libro: detalle.libro,
              cantidad: detalle.cantidad,
              precioUnitario: detalle.precioUnitario
            }));
          } else {
            console.warn(`No se encontraron detalles para el pedido ID: ${pedido.id}`);
            pedido.detalles = [];
          }
         
          return pedido;
        }),
        catchError(error => {
          console.error('Error al obtener el pedido por ID:', error);
          return throwError(() => new Error('Error al obtener el pedido: ' + error.message));
        })
      );
    }

    // Método para crear un detalle de pedido
    createDetallePedido(detallePedido: any): Observable<any> {
      return this.http.post<any>(`${this.urlEndPointDetallePedido}`, detallePedido).pipe(
        map(response => {
          if (response && response.detallePedido) {
            return response.detallePedido;
          } else {
            return response;
          }
        }),
        catchError(error => {
          console.error('Error al crear el detalle de pedido:', error);
          return throwError(() => error);
        })
      );
    }
   
    // Método para enviar el email de confirmación después de crear todos los detalles del pedido
    enviarEmailConfirmacion(pedidoId: number): Observable<any> {
      return this.http.post<any>(`${this.urlEndPointPedido}/enviar-email/${pedidoId}`, {}).pipe(
        map(response => {
          return response;
        }),
        catchError(error => {
          console.error('Error al enviar el email de confirmación:', error);
          return throwError(() => error);
        })
      );
    }
}
