import { Component, OnInit } from '@angular/core';
import { AutorService } from './autor.service';
import { Autor } from './autor';
import swal from 'sweetalert2';
import { AuthService } from '../login/auth.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-autor',
  standalone: false,
  templateUrl: './autor.component.html',
  styleUrls: ['./autor.component.css']
})
export class AutorComponent implements OnInit {
  autores: Autor[] = [];
  paginador: any;
  currentPage: number = 0;
  currentPageSize: number = 6;

  constructor(
    private autorService: AutorService,  
    public authService: AuthService,
    private router: Router,
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
      
      this.cargarAutores();
    });
  }

  cargarAutores(): void {
    // Por ahora usamos el método estándar sin paginación, en caso de que el backend no tenga el endpoint paginado
    this.autorService.getAutores().subscribe({
      next: (autores) => {
        // Crear un objeto de paginación simulado para que funcione el paginador
        this.paginador = {
          content: autores,
          number: this.currentPage,
          size: this.currentPageSize,
          totalElements: autores.length,
          totalPages: Math.ceil(autores.length / this.currentPageSize),
          first: this.currentPage === 0,
          last: this.currentPage >= Math.ceil(autores.length / this.currentPageSize) - 1,
          numberOfElements: Math.min(this.currentPageSize, autores.length - this.currentPage * this.currentPageSize)
        };
        
        // Aplicar paginación en cliente
        const start = this.currentPage * this.currentPageSize;
        const end = start + this.currentPageSize;
        this.autores = autores.slice(start, end);
      },
      error: (error) => {
        console.error('Error cargando los autores: ', error);
        this.autores = [];
        this.paginador = null;
      }
    });
  }

  // Eliminar autor con confirmación
  delete(autor: Autor): void {
    // Mensaje de confirmación de eliminación
    swal({
      title: `¿Estás seguro de eliminar el autor "${autor.nombre}"?`,
      text: "¡Esta operación no es reversible!",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "¡Sí, eliminalo!",
      cancelButtonText: "No, cancelar",
      buttonsStyling: true,
      reverseButtons: true
    }).then((result) => {
      if (result.value) {
        this.autorService.delete(autor.id).subscribe(
          response => {
            // Cuando la eliminación es exitosa, actualizamos la lista con paginación
            this.cargarAutores();
            swal(
              '¡Eliminado!',
              `El autor "${autor.nombre}" ha sido eliminado con éxito`,
              'success'
            );
          },
          error => {
            console.error('Error al eliminar el autor', error);
            swal(
              'Error',
              'Hubo un problema al eliminar el autor',
              'error'
            );
          }
        );
      } else if (result.dismiss === swal.DismissReason.cancel) {
        swal(
          'Cancelado',
          'Tu autor está a salvo :)',
          'error'
        );
      }
    });
  }

  deleteAll(): void {
    // Mensaje confirmacion eliminar todos
    swal({
      title: '¿Estás seguro de eliminar todos los autores?',
      text: "¡Esta operación no es reversible!",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "¡Sí, eliminar todos!",
      cancelButtonText: "No, cancelar",
      buttonsStyling: true,
      reverseButtons: true
    }).then((result) => {
      if (result.value) {
        this.autorService.deleteAll().subscribe(
          response => {
            // Vaciamos el array de autores
            this.autores = [];
            this.paginador = null;
  
            swal(
              '¡Eliminados!',
              'Todos los autores han sido eliminados :(',
              'success'
            );
          }
        );
      } else if (result.dismiss === swal.DismissReason.cancel) {
        swal(
          'Cancelado',
          'Tus autores están a salvo :)',
          'error'
        )
      }
    });
  }

  verLibrosAutor(autorId: number): void {
    this.router.navigate(['/libros/autor', autorId, 'page', 0, 'size',4]);
  }
}
