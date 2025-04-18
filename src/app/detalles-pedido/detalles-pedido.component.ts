import { Component } from '@angular/core';
import { DetallesPedidoService } from './detalles-pedido.service';
import { detallesPedido } from './detalles-pedido';

@Component({
  selector: 'app-detalles-pedido',
  standalone: false,
  templateUrl: './detalles-pedido.component.html',
  styleUrl: './detalles-pedido.component.css'
})
export class DetallesPedidoComponent {
  detallesPedido: detallesPedido[] = [];
  constructor(private detallesPedidoService: DetallesPedidoService) {}

  ngOnInit(): void {
    this.detallesPedidoService.getdetallesPedido().subscribe(
      (detallesPedidos: detallesPedido[]) => {
        this.detallesPedido = detallesPedidos;
      },
      error => {
        console.error('Error al obtener los detalles de los carritos', error);  // Muestra errores si los hay
      }
    )
  };
}
