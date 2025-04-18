import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../login/auth.service';
import { DetallesUsuarioService } from '../detalles-usuario/detalles-usuario.service';
import { Usuario } from '../usuario/usuario';
import { DetallesCarritoService } from '../detalles-carrito/detalles-carrito.service';
import { detallesCarrito } from '../detalles-carrito/detalles-carrito';
import swal from 'sweetalert2';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit{

  userId: number = 0;
  cartItemCount: number = 0;

  constructor(
    public authService: AuthService,
    private http: HttpClient,
    private router: Router,
    private usuarioService: DetallesUsuarioService,
    private carritoService: DetallesCarritoService
  ) {}

  ngOnInit(): void {
    // Suscribirse a los cambios en el contador del carrito
    this.carritoService.getCartItemCount().subscribe(count => {
      this.cartItemCount = count;
    });

    // Obtener el ID del usuario actual al iniciar
    this.userId = this.authService.getCurrentUserId();
    
    // Si no hay ID válido, intentar obtener el usuario por email
    if (!this.userId || this.userId <= 0) {
      const email = this.authService.getCurrentUserEmail();
      if (email) {
        this.obtenerUsuarioPorEmail(email);
      }
    }
    
    // Subscribe al observable para mantenernos actualizados con cambios en la autenticación
    this.authService.usuarioActual.subscribe(user => {
      if (user && user.id && !isNaN(Number(user.id))) {
        this.userId = Number(user.id);
      } else if (user && user.email) {
        // Si no hay ID pero sí email, intentar obtener el usuario por email
        this.obtenerUsuarioPorEmail(user.email);
      } else {
        // Si no hay usuario o no tiene ID válido, intentar obtenerlo del servicio
        this.userId = this.authService.getCurrentUserId();
        
        // Si aún no hay ID válido, intentar por email
        if (!this.userId || this.userId <= 0) {
          const email = this.authService.getCurrentUserEmail();
          if (email) {
            this.obtenerUsuarioPorEmail(email);
          }
        }
      }
    });
  }
  
  obtenerUsuarioPorEmail(email: string): void {
    this.usuarioService.obtenerUsuarioPorEmail(email).subscribe(
      (usuario: Usuario) => {
        if (usuario && usuario.id) {
          this.userId = usuario.id;
          
          // Actualizar el ID en el servicio de autenticación
          const usuarioActual = this.authService.getCurrentUser();
          if (usuarioActual) {
            usuarioActual.id = usuario.id;
            localStorage.setItem('usuario', JSON.stringify(usuarioActual));
            // No actualizamos el subject para evitar un bucle infinito
          }
        }
      },
      (error: any) => {
        console.error('Error al obtener usuario por email en header:', error);
      }
    );
  }

  // Array de categorías (puedes añadir más según lo necesites)
  categorias = [
    { nombre: 'Ficción' },
    { nombre: 'No Ficción' },
    { nombre: 'Ciencia' },
    { nombre: 'Historia' },
    { nombre: 'Literatura Infantil' },
    { nombre: 'Biografías' },
  ];

  onSearch(searchTerm: string){
    console.log('Busqueda: ', searchTerm);
  }

  logout() {
    this.authService.logout();
  }

  getLogueado() {
    return this.authService.estaLogueado();
  }
}
