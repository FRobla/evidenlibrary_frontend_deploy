import { Component } from '@angular/core';
import { AuthService } from '../login/auth.service';
import { Router } from '@angular/router';
import swal from 'sweetalert2';

@Component({
  selector: 'app-registro',
  standalone: false,
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.css']
})
export class RegistroComponent {
  firstName: string = '';
  lastName: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit() {
    if (this.password !== this.confirmPassword) {
      swal(
        'Error',
        'Las contraseñas no coinciden',
        'error'
      );
      return;
    }

    this.authService.registro({
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      password: this.password
    }).subscribe({
      next: () => {
        swal({
          title: '¡Registro exitoso!',
          text: 'Tu cuenta ha sido creada correctamente. Ahora puedes iniciar sesión con tus credenciales.',
          type: 'success',
          showCancelButton: true,
          confirmButtonText: 'Iniciar sesión',
          cancelButtonText: 'Cancelar'
        }).then((result) => {
          if (result.value) {
            this.router.navigate(['/login']);
          }
        });
      },
      error: (error) => {
        console.error('Error de registro:', error);
        swal(
          'Error de registro',
          error.error?.mensaje || 'No se pudo completar el registro. Por favor, intenta de nuevo.',
          'error'
        );
      }
    });
  }
}
