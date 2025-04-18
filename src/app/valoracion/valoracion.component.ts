import { Component, OnInit } from '@angular/core';
import { Valoracion } from './valoracion';
import { ValoracionService } from './valoracion.service';
import swal from 'sweetalert2';
import { AuthService } from '../login/auth.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-valoracion',
  standalone: false,
  templateUrl: './valoracion.component.html',
  styleUrl: './valoracion.component.css'
})
export class ValoracionComponent implements OnInit {
  valoraciones: Valoracion[] = [];
  paginador: any;
  currentPage: number = 0;
  currentPageSize: number = 6;

  constructor(
    private valoracionService: ValoracionService,
    public authService: AuthService,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Escuchar cambios en los parámetros de ruta y consulta
    this.activatedRoute.queryParams.subscribe(params => {
      // Actualizar página actual
      const pageParam = params['page'];
      if (pageParam) {
        this.currentPage = +pageParam;
      }
      
      // Actualizar tamaño de página
      const sizeParam = params['size'];
      if (sizeParam) {
        this.currentPageSize = +sizeParam;
      }
      
      this.cargarValoraciones();
    });
  }

  cargarValoraciones(): void {
    // Por ahora usamos el método estándar sin paginación, en caso de que el backend no tenga el endpoint paginado
    this.valoracionService.getValoraciones().subscribe({
      next: (valoraciones) => {
        this.valoraciones = valoraciones;
        // Crear un objeto de paginación simulado para que funcione el paginador
        this.paginador = {
          content: valoraciones,
          number: this.currentPage,
          size: this.currentPageSize,
          totalElements: valoraciones.length,
          totalPages: Math.ceil(valoraciones.length / this.currentPageSize),
          first: this.currentPage === 0,
          last: this.currentPage >= Math.ceil(valoraciones.length / this.currentPageSize) - 1,
          numberOfElements: Math.min(this.currentPageSize, valoraciones.length - this.currentPage * this.currentPageSize)
        };
        
        // Aplicar paginación en cliente
        const start = this.currentPage * this.currentPageSize;
        const end = start + this.currentPageSize;
        this.valoraciones = valoraciones.slice(start, end);
      },
      error: (error) => {
        console.error('Error cargando las valoraciones: ', error);
        this.valoraciones = [];
        this.paginador = null;
      }
    });
  }

  // Método para generar array de estrellas
  getStarsArray(puntuacion: number): number[] {
    return Array(puntuacion).fill(0);
  }

  // Método para generar array de estrellas vacías
  getEmptyStarsArray(puntuacion: number): number[] {
    return Array(5 - puntuacion).fill(0);
  }

  // Eliminar valoracion con confirmación
  delete(valoracion: Valoracion): void {
    // Mensaje de confirmación de eliminación
    swal({
      title: `¿Estás seguro de eliminar la valoracion con ID: ${valoracion.id}?`,
      text: "¡Esta operación no es reversible!",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "¡Sí, eliminar!",
      cancelButtonText: "No, cancelar",
      buttonsStyling: true,
      reverseButtons: true
    }).then((result) => {
      if (result.value) {
        this.valoracionService.delete(valoracion.id).subscribe(
          response => {
            // Cuando la eliminación es exitosa, actualizamos la lista con paginación
            this.cargarValoraciones();
            swal(
              '¡Eliminado!',
              `La valoracion con ID: ${valoracion.id}, ha sido eliminado con éxito`,
              'success'
            );
          },
          error => {
            console.error('Error al eliminar la valoracion', error);
            swal(
              'Error',
              'Hubo un problema al eliminar la valoracion',
              'error'
            );
          }
        );
      } else if (result.dismiss === swal.DismissReason.cancel) {
        swal(
          'Cancelado',
          'Tu valoracion está a salvo :)',
          'error'
        );
      }
    });
  }
}
