import { Component, OnInit } from '@angular/core';
import { Usuario } from './usuario';
import { UsuarioService } from './usuario.service';
import { Router } from '@angular/router';
import { AuthService } from '../login/auth.service';

@Component({
  selector: 'app-usuario',
  standalone: false,
  templateUrl: './usuario.component.html',
  styleUrl: './usuario.component.css'
})
export class UsuarioComponent implements OnInit{

  usuarios : Usuario[]= [];
  constructor(private usuarioService: UsuarioService, private router: Router, public authService: AuthService ) {}

  ngOnInit(): void {
    this.usuarioService.getUsuarios().subscribe(
      (usuarios : Usuario[]) => {
        this.usuarios = usuarios;
      },
      error => {
        console.error('Error al obtener los usuarios', error);  // Muestra errores si los hay
      }
    )
  };

  getDetallesUsuario(id: number) {
    this.router.navigate(['/usuario', id]);
  }
}
