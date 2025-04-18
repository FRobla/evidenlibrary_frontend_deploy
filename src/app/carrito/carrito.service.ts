import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Carrito } from './carrito';
import { detallesCarrito } from '../detalles-carrito/detalles-carrito';
import { Libro } from '../libro/libro';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class CarritoService {
  private urlEndPoint: string = 'https://evidenlibrary-backend.onrender.com/api/carritos';

  private carrito: any[] = [];

  constructor(private http: HttpClient, private router: Router) {}

  getCarritos(): Observable<Carrito[]> {
    return this.http.get<any[]>(this.urlEndPoint).pipe(
      map(response => {
        return response.map(item => {
          const carrito = new Carrito();
          if (item.usuario) {
            carrito.usuario = item.usuario;
          }
          carrito.fechaCreacion = new Date(item.fechaCreacion);
          carrito.estado = item.estado;
          carrito.detalles = item.detalles?.map((detalle: any) => {
            const detalleCarrito = new detallesCarrito();
            detalleCarrito.id = detalle.id;
            detalleCarrito.cantidad = detalle.cantidad;
            detalleCarrito.precioUnitario = detalle.precioUnitario;
           
            // Mapear el libro correctamente
            if (detalle.libro) {
              const libro = new Libro();
              libro.id = detalle.libro.id;
              libro.titulo = detalle.libro.titulo;
              libro.precio = detalle.libro.precio;
              libro.stock = detalle.libro.stock;
              detalleCarrito.libro = libro;
            }
           
            return detalleCarrito;
          }) || [];
          return carrito;
        });
      })
    );
  }

  addToCarrito(libro: any): void {
    console.log('Añadir libro al carrito', libro);
  }
}