import { Component } from '@angular/core';
import { Pedido } from './pedido';
import { PedidoService } from './pedido.service';
import { AuthService } from '../login/auth.service';

@Component({
  selector: 'app-pedido',
  standalone: false,
  templateUrl: './pedido.component.html',
  styleUrl: './pedido.component.css'
})
export class PedidoComponent {
  pedidos: Pedido[] = [];
  error: string = '';

  constructor(private pedidoService: PedidoService, public authService: AuthService ) {}

  ngOnInit(): void {
    this.getPedidos();
  }

  getPedidos(): void {
    this.pedidoService.getPedidos().subscribe(
      (pedidos: Pedido[]) => {
        this.pedidos = pedidos;
      },
      error => {
        console.error('Error al obtener los pedidos', error);
        this.error = 'Hubo un error al cargar los pedidos. Por favor, intente nuevamente.';
      }
    );
  }
}
