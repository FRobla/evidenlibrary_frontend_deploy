import { Component, OnInit } from '@angular/core';
import { Genero } from './generos';
import { GeneroService } from './generos.service';
import swal from 'sweetalert2';
import { AuthService } from '../login/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-generos',
  standalone: false,
  templateUrl: './generos.component.html',
  styleUrl: './generos.component.css'
})
export class GenerosComponent implements OnInit{
  generos : Genero[]= [];
  constructor(private generoService: GeneroService, 
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.generoService.getGeneros().subscribe(
      (generos: Genero[]) => {
        this.generos = generos;
      },
      error => {
        console.error('Error al obtener los generos', error);  // Muestra errores si los hay
      }
    );
    // Obtener generoes al cargar el componente
    this.generoService.getGeneros().subscribe();
  }

  // Eliminar genero con confirmación
  delete(genero: Genero): void {
    // Mensaje de confirmación de eliminación
    swal({
      title: `¿Estás seguro de eliminar el genero "${genero.nombre}"?`,
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
        this.generoService.delete(genero.id).subscribe(
          response => {
            // Cuando la eliminación es exitosa, actualizamos la lista
            this.generos = this.generos.filter(a => a.id !== genero.id);
            swal(
              '¡Eliminado!',
              `El genero "${genero.nombre}" ha sido eliminado con éxito`,
              'success'
            );
          },
          error => {
            console.error('Error al eliminar el genero', error);
            swal(
              'Error',
              'Hubo un problema al eliminar el genero',
              'error'
            );
          }
        );
      } else if (result.dismiss === swal.DismissReason.cancel) {
        swal(
          'Cancelado',
          'Tu genero está a salvo :)',
          'error'
        );
      }
    });
  }

  deleteAll(): void {
    // Mensaje confirmacion eliminar todos
    swal({
      title: '¿Estás seguro de eliminar todos los generoes?',
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
        this.generoService.deleteAll().subscribe(
          response => {
            // Vaciamos el array de generoes
            this.generos = [];
  
            swal(
              '¡Eliminados!',
              'Todos los generoes han sido eliminados :(',
              'success'
            );
          }
        );
      } else if (result.dismiss === swal.DismissReason.cancel) {
        swal(
          'Cancelado',
          'Tus generoes están a salvo :)',
          'error'
        )
      }
    });
  }
    
  verLibrosGenero(generoId: number): void {
    this.router.navigate(['/libros'], {
      queryParams: {
        generoId: generoId,
        page: 0,
        size: 8
      }
    });
  }
}
    