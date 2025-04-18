import { Component } from '@angular/core';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  email: string = '';
  password: string = '';

  constructor(
    private authService: AuthService, 
    private router: Router
  ) {}

  onSubmit() {
    this.authService.login({
      email: this.email, 
      password: this.password
    }).subscribe({
      next: (usuario) => {
        swal(
          `¡Bienvenido ${usuario.username}!`,
          '',
          'success'
        );
  
        // Redirigir según el rol
        switch(usuario.rol) {
          case 'ADMIN':
            this.router.navigate(['/admin']);
            break;
          case 'USER':
            this.router.navigate(['/principal']);
            break;
          default:
            console.error('Rol no reconocido');
            this.router.navigate(['/principal']);
        }
      },
      error: (error) => {
        console.error('Error de inicio de sesión:', error);
        
        swal(
          'Error de inicio de sesión :(',
          error.error?.mensaje || 'Credenciales inválidas',
          'error'
        );
      }
    });
  }
  
}
