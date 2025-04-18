import { Component } from '@angular/core';
import { Favorito } from './favorito';
import { FavoritoService } from './favorito.service';
import { FavoritosAgrupados } from './favoritos-agrupados';
import { AuthService } from '../login/auth.service';

@Component({
  selector: 'app-favorito',
  standalone: false,
  templateUrl: './favorito.component.html',
  styleUrl: './favorito.component.css'
})
export class FavoritoComponent {
  favoritos: Favorito[]= [];
  favoritosAgrupados: FavoritosAgrupados[] = [];

  constructor(private favoritoService: FavoritoService,  public authService: AuthService ) {}

  ngOnInit(): void {
    this.favoritoService.getUsuarios().subscribe(
      (favoritos: Favorito[]) => {
        this.favoritos = favoritos;
        this.agruparFavoritos();
      },
      error => {
        console.error('Error al obtener los usuarios', error);  // Muestra errores si los hay
      }
    )
  };

  agruparFavoritos() {
    // Crear un Map para agrupar por usuario
    const gruposPorUsuario = new Map<string, FavoritosAgrupados>();
    
    this.favoritos.forEach(favorito => {
      if (favorito.usuario && favorito.libro && favorito.fechaAgregado) {
        const usuarioKey = `${favorito.usuario.nombre}-${favorito.usuario.apellido}`;
        
        if (!gruposPorUsuario.has(usuarioKey)) {
          gruposPorUsuario.set(usuarioKey, {
            usuario: favorito.usuario,
            libros: []
          });
        }
        
        gruposPorUsuario.get(usuarioKey)?.libros.push({
          libro: favorito.libro,
          fechaAgregado: new Date(favorito.fechaAgregado)  // Convertir string a Date
        });
      }
    });
    
    this.favoritosAgrupados = Array.from(gruposPorUsuario.values());
  }
}
