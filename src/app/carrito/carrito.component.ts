import { Component, OnInit } from '@angular/core';
import { Carrito } from './carrito';
import { CarritoService } from './carrito.service';
import { AuthService } from '../login/auth.service';

@Component({
  selector: 'app-carrito',
  standalone: false,
  templateUrl: './carrito.component.html',
  styleUrl: './carrito.component.css'
})
export class CarritoComponent implements OnInit {
  carritos: Carrito[] = [];

  constructor(private carritoService: CarritoService,  public authService: AuthService ) {}

  ngOnInit(): void {
    this.carritoService.getCarritos().subscribe(
      carritos => {
        this.carritos = carritos;
      },
      error => {
        console.error('Error al obtener los carritos:', error);
      }
    );
  }
}
