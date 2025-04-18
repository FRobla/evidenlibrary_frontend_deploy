import { HttpClient} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { detallesPedido } from './detalles-pedido';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class DetallesPedidoService {

    private urlEndPoint: string = 'https://evidenlibrary-backend.onrender.com/api/detallesPedido'; 
  
    constructor(private http: HttpClient, private router: Router) {}  

    getdetallesPedido(): Observable<detallesPedido[]> {
      return this.http.get(this.urlEndPoint).pipe(
  
        // Conversión a detallesPedido (response de Object a detallesPedido[])
        map(response => {
  
          let detallesPedido = response as detallesPedido[];
  
          return detallesPedido.map(detallesPedido => {
            detallesPedido.pedido = detallesPedido.pedido;
            detallesPedido.libro = detallesPedido.libro;
            detallesPedido.cantidad = detallesPedido.cantidad;
            detallesPedido.precioUnitario = detallesPedido.precioUnitario;
           
            return detallesPedido;
          });
        }),
      ); 
    }
}
