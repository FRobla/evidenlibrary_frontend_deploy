import { Component, OnInit } from '@angular/core';
import { FavoritoService } from '../favorito/favorito.service';
import { Favorito } from '../favorito/favorito';
import { AuthService } from '../login/auth.service';
import { Router } from '@angular/router';
import swal from 'sweetalert2';

@Component({
  selector: 'app-detalles-favorito',
  standalone: false,
  templateUrl: './detalles-favorito.component.html',
  styleUrl: './detalles-favorito.component.css'
})
export class DetallesFavoritoComponent implements OnInit {
  favoritos: Favorito[] = [];
  cargando: boolean = true;

  constructor(
    private favoritoService: FavoritoService,
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarFavoritos();
  }

  cargarFavoritos(): void {
    this.cargando = true;
    const usuarioId = this.authService.getCurrentUserId();
    
    if (!usuarioId) {
      console.error('No se encontró ID de usuario');
      this.cargando = false;
      this.favoritos = [];
      return;
    }
    
    this.favoritoService.getFavoritosByUsuarioId(usuarioId).subscribe({
      next: (favoritos) => {
        this.favoritos = favoritos || [];
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar favoritos:', error);
        // Si el error es 404 (no encontrado), simplemente mostramos la lista vacía
        if (error.status === 404) {
          this.favoritos = [];
          this.cargando = false;
        } else {
          this.cargando = false;
          swal('Error', 'No se pudieron cargar tus favoritos', 'error');
        }
      }
    });
  }

  eliminarFavorito(favorito: Favorito): void {
    if (!favorito || !favorito.id) {
      console.error('Intento de eliminar favorito sin ID');
      return;
    }

    swal({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar "${favorito.libro?.titulo}" de tus favoritos?`,
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      buttonsStyling: true,
      reverseButtons: true
    }).then((result) => {
      if (result.value) {
        this.favoritoService.delete(favorito).subscribe({
          next: () => {
            // Eliminar el favorito de la lista local
            this.favoritos = this.favoritos.filter(f => f.id !== favorito.id);
            swal('Eliminado', 'El libro ha sido eliminado de tus favoritos', 'success');
          },
          error: (error) => {
            console.error('Error al eliminar favorito:', error);
            if (error.status === 404) {
              // Si el favorito no existe, actualizamos la lista
              this.cargarFavoritos();
              swal('Información', 'El favorito ya había sido eliminado', 'info');
            } else {
              swal('Error', 'No se pudo eliminar el favorito', 'error');
            }
          }
        });
      }
    });
  }

  verDetallesLibro(libroId: number): void {
    this.router.navigate(['/libro', libroId]);
  }

  // Método helper para obtener el nombre del autor de manera segura
  getNombreAutor(favorito: Favorito): string {
    if (favorito.libro && 
        favorito.libro.autores && 
        favorito.libro.autores.length > 0 && 
        favorito.libro.autores[0] && 
        favorito.libro.autores[0].nombre) {
      return favorito.libro.autores[0].nombre;
    }
    return 'Autor desconocido';
  }
}
