import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, map, catchError } from 'rxjs';
import { PedidoService } from '../pedido/pedido.service';
import { Pedido } from '../pedido/pedido';
import { detallesPedido } from '../detalles-pedido/detalles-pedido';

@Injectable({
  providedIn: 'root'
})
export class LibrosCompradosService {
  // Caché de libros comprados por usuario
  private librosCompradosPorUsuario: Map<number, Set<number>> = new Map();
  // Flag para saber si ya se han cargado los libros comprados
  private librosCompradosCargados: boolean = false;

  constructor(private pedidoService: PedidoService) { }

  /**
   * Carga todos los libros comprados por un usuario
   * @param usuarioId ID del usuario
   * @returns Observable que emite true cuando se completa la carga
   */
  cargarLibrosComprados(usuarioId: number): Observable<boolean> {
    // Si ya se han cargado los libros comprados, devolvemos true
    if (this.librosCompradosCargados && this.librosCompradosPorUsuario.has(usuarioId)) {
      return of(true);
    }

    // Obtenemos los pedidos del usuario
    return this.pedidoService.getPedidosPorUsuarioId(usuarioId).pipe(
      map(pedidos => {
        // Creamos un conjunto para almacenar los IDs de los libros comprados
        const librosComprados = new Set<number>();

        // Recorremos todos los pedidos
        pedidos.forEach(pedido => {
          // Solo consideramos pedidos completados o en proceso
          if (pedido.estado === 'COMPLETADO' || pedido.estado === 'EN_PROCESO') {
            // Recorremos los detalles de cada pedido
            pedido.detalles.forEach(detalle => {
              // Añadimos el ID del libro al conjunto
              if (detalle.libro && detalle.libro.id) {
                librosComprados.add(detalle.libro.id);
              }
            });
          }
        });

        // Guardamos el conjunto en el mapa
        this.librosCompradosPorUsuario.set(usuarioId, librosComprados);
        this.librosCompradosCargados = true;
        
        return true;
      }),
      catchError(error => {
        console.error('Error al cargar los libros comprados:', error);
        return of(false);
      })
    );
  }

  /**
   * Verifica si un usuario ha comprado un libro
   * @param usuarioId ID del usuario
   * @param libroId ID del libro
   * @returns true si el usuario ha comprado el libro, false en caso contrario
   */
  haCompradoLibro(usuarioId: number, libroId: number): boolean {
    // Si no se han cargado los libros comprados, devolvemos false
    if (!this.librosCompradosCargados || !this.librosCompradosPorUsuario.has(usuarioId)) {
      return false;
    }

    // Obtenemos el conjunto de libros comprados por el usuario
    const librosComprados = this.librosCompradosPorUsuario.get(usuarioId);
    
    // Verificamos si el libro está en el conjunto
    return librosComprados ? librosComprados.has(libroId) : false;
  }

  /**
   * Limpia la caché de libros comprados
   */
  limpiarCache(): void {
    this.librosCompradosPorUsuario.clear();
    this.librosCompradosCargados = false;
  }
} 