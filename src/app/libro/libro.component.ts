import { Component, OnInit, HostListener } from '@angular/core';
import { LibroService } from './libro.service';
import { Libro } from './libro';
import { ActivatedRoute, NavigationEnd, NavigationStart, Router } from '@angular/router';
import { filter, tap } from 'rxjs';
import swal from 'sweetalert2';
import { AuthService } from '../login/auth.service';
import { Autor } from '../autor/autor';
import { DetallesCarritoService } from '../detalles-carrito/detalles-carrito.service';
import { LibrosCompradosService } from '../services/libros-comprados.service';
import { GeneroService } from '../generos/generos.service';
import { Genero } from '../generos/generos';

@Component({
  selector: 'app-libro',
  standalone: false,
  templateUrl: './libro.component.html',
  styleUrls: ['./libro.component.css']
})
export class LibroComponent implements OnInit{

  libros : Libro[]= [];
  autores : Autor[]= [];
  generos: Genero[] = [];
  paginador: any;
  animationState = "in"
  pageSizes: number[] = [4, 8, 12, 16]; // Opciones de tamaño de página
  currentPageSize: number = 8; // Tamaño de página por defecto
  currentPage: number = 0; // Página actual
  selectedAutorId: number = 0; // ID del autor seleccionado (0 para todos)
  selectedGeneroId: number = 0; // ID del género seleccionado (0 para todos)
  isMobile: boolean = false;


  constructor(
    private libroService: LibroService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    public authService: AuthService,
    private carritoService: DetallesCarritoService,
    private librosCompradosService: LibrosCompradosService,
    private generoService: GeneroService
  ) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationStart)
    ).subscribe(() => {
      this.handleViewTransition();
    });
    
    this.checkScreenSize();
  }

  @HostListener('window:resize')
  onResize() {
    this.checkScreenSize();
  }

  private checkScreenSize() {
    const wasMobile = this.isMobile;
    const oldPageSize = this.currentPageSize;
    
    this.isMobile = window.innerWidth < 768; // Consideramos móvil si el ancho es menor a 768px
    
    // Actualizar el tamaño de página si ha cambiado la vista
    if (this.isMobile && !wasMobile) {
      this.currentPageSize = 4;
      console.log('Cambiado a vista móvil, tamaño de página:', this.currentPageSize);
    } else if (!this.isMobile && wasMobile) {
      this.currentPageSize = 8;
      console.log('Cambiado a vista desktop, tamaño de página:', this.currentPageSize);
    }
    
    // Solo cargar libros si el tamaño de página ha cambiado
    if (oldPageSize !== this.currentPageSize) {
      this.cargarLibros();
    }
  }

  handleViewTransition(): void {
    if ('startViewTransition' in document) {
      // Use the modern View Transitions API if available
      (document as any).startViewTransition();
    }
  }

  ngOnInit(): void {
    //Cargamos la lista de autores
    this.cargarAutores();
    //Cargamos la lista de géneros
    this.cargarGeneros();

    // Escuchar cambios en los parámetros de ruta y consulta
    this.activatedRoute.params.subscribe(params => {
      // Comprobar parámetros de ruta primero
      if (params['page']) {
        this.currentPage = +params['page'];
      }
      
      if (params['autorId']) {
        this.selectedAutorId = +params['autorId'];
      }
      
      if (params['generoId']) {
        this.selectedGeneroId = +params['generoId'];
      }
      
      if (params['size']) {
        this.currentPageSize = +params['size'];
      }
    });

    // Comprobar parámetros de consulta después (tienen prioridad sobre los parámetros de ruta)
    this.activatedRoute.queryParams.subscribe((params: { [key: string]: string | string[] | undefined }) => {
      console.log('Query params recibidos:', params);
      
      // Actualizar página actual
      const pageParam = params['page'];
      if (pageParam && typeof pageParam === 'string') {
        this.currentPage = +pageParam;
        console.log('Página actualizada a:', this.currentPage);
      }

      // Actualizar filtro de autor
      const autorIdParam = params['autorId'];
      if (autorIdParam && typeof autorIdParam === 'string') {
        this.selectedAutorId = +autorIdParam;
        console.log('Autor ID actualizado a:', this.selectedAutorId);
      }

      // Actualizar filtro de género
      const generoIdParam = params['generoId'];
      if (generoIdParam !== undefined && generoIdParam !== null) {
        // Convertir a número, independientemente de si es string o number
        const generoIdNum = parseInt(generoIdParam as string, 10);
        if (!isNaN(generoIdNum)) {
          this.selectedGeneroId = generoIdNum;
          console.log('Género ID actualizado a:', this.selectedGeneroId, '(tipo:', typeof this.selectedGeneroId, ')');
        } else {
          console.error('Error al convertir generoId:', generoIdParam);
        }
      }
      
      // Actualizar tamaño de página
      const sizeParam = params['size'];
      if (sizeParam && typeof sizeParam === 'string') {
        this.currentPageSize = +sizeParam;
        console.log('Tamaño de página actualizado a:', this.currentPageSize);
      }

      // Si el usuario está logueado, cargamos sus libros comprados
      if (this.authService.estaLogueado()) {
        const usuarioId = this.authService.getCurrentUserId();
        this.librosCompradosService.cargarLibrosComprados(usuarioId).subscribe(
          () => this.cargarLibros()
        );
      } else {
        this.cargarLibros();
      }
    });
    
    /* Sin paginacion */
    /*
    this.libroService.getLibros().subscribe(
      (libros: Libro[]) => {
        this.libros = libros;
        console.log('Detalles del libro recibidos:', libros);
      },
      error => {
        console.error('Error al obtener los detalles del libro', error);
      }
    ) */
  };

  irAtras(): void {
    if ("startViewTransition" in document) {
      document.documentElement.classList.add("navigating-back")
      ;(document as any).startViewTransition(() => {
        window.history.back()
        // Eliminar la clase después de la transición
        setTimeout(() => {
          document.documentElement.classList.remove("navigating-back")
        }, 300)
      })
    } else {
      window.history.back()
    }
  }

  // Método para navegar a detalles con View Transitions
  getDetallesLibro(id: number): void {
    if ('startViewTransition' in document) {
      (document as any).startViewTransition(() => {
        this.router.navigate(['/libro', id]);
      });
    } else {
      this.router.navigate(['/libro', id]);
    }
  }

  deleteAll(): void {
    // Mensaje confirmacion eliminar todos
    swal({
      title: '¿Estás seguro de eliminar todos los libros?',
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
        this.libroService.deleteAll().subscribe(
          response => {
            // Vaciamos el array de libros
            this.libros = [];
 
            swal(
              '¡Eliminados!',
              'Todos los libros han sido eliminados :(',
              'success'
            );
          }
        );
      } else if (result.dismiss === swal.DismissReason.cancel) {
        swal(
          'Cancelado',
          'Tus libros están a salvo :)',
          'error'
        )
      }
    });
  }

  // Método para cargar libros con el tamaño de página actual
  /* cargarLibros(): void {
    this.libroService.getLibrosConTamanio(this.currentPage, this.currentPageSize)
    .subscribe(response => {
      this.libros = response.content as Libro[];
      this.paginador = response;
    });
  } */

  // Cargar autores para el filtro
  cargarAutores(): void {
    this.libroService.getAutores().subscribe({
      next: (autores) => {
        this.autores = autores;
      },
      error: (error) => {
        console.error('Error al cargar autores:', error);
        this.autores = [];
      }
    });
  }
 
  // Método para cambiar el tamaño de la página
  cambiarTamanioPagina(event: any): void {
    this.currentPageSize = +event.target.value;
    this.currentPage = 0; // Volvemos a la primera página al cambiar el tamaño
    
    // Actualizar la URL con los parámetros actuales
    const params: any = { page: this.currentPage };
    
    // Mantener los filtros existentes
    if (this.selectedAutorId > 0) {
      params.autorId = this.selectedAutorId;
    }
    
    if (this.selectedGeneroId > 0) {
      params.generoId = this.selectedGeneroId;
    }
    
    // Añadir el tamaño de página a los parámetros
    params.size = this.currentPageSize;
    
    this.router.navigate(['/libros'], {
      queryParams: params
    });
  }

  // Método para filtrar por autor
  filtrarPorAutor(event: any): void {
    const autorId = +event.target.value;
    this.selectedAutorId = autorId;
    this.currentPage = 0; // Resetear a la primera página
   
    // Actualizar la URL con los parámetros actuales
    const params: any = { page: this.currentPage };
   
    if (autorId > 0) {
      params.autorId = autorId;
    }
   
    if (this.selectedGeneroId > 0) {
      params.generoId = this.selectedGeneroId;
    }
    
    // Incluir el tamaño de página en los parámetros
    params.size = this.currentPageSize;
   
    this.router.navigate(['/libros'], {
      queryParams: params
    });
  }

  // Método para filtrar por género
  filtrarPorGenero(generoId: number): void {
    this.selectedGeneroId = generoId;
    this.currentPage = 0; // Resetear a la primera página
   
    // Actualizar la URL con los parámetros actuales
    const params: any = { page: this.currentPage };
   
    if (this.selectedAutorId > 0) {
      params.autorId = this.selectedAutorId;
    }
   
    if (generoId > 0) {
      params.generoId = generoId;
    }
    
    // Incluir el tamaño de página en los parámetros
    params.size = this.currentPageSize;
   
    this.router.navigate(['/libros'], {
      queryParams: params
    });
  }

  // Método para cargar libros con el tamaño de página actual y filtros
  cargarLibros(): void {
    console.log('Cargando libros con estos filtros:');
    console.log('- Autor ID:', this.selectedAutorId, '(tipo:', typeof this.selectedAutorId, ')');
    console.log('- Género ID:', this.selectedGeneroId, '(tipo:', typeof this.selectedGeneroId, ')');
    console.log('- Página:', this.currentPage);
    console.log('- Tamaño de página:', this.currentPageSize);
    
    // Si ambos filtros están activos
    if (this.selectedAutorId > 0 && this.selectedGeneroId > 0) {
      console.log('Cargando libros por autor y género');
      this.libroService.getLibrosPorAutorYGenero(this.currentPage, this.currentPageSize, this.selectedAutorId, this.selectedGeneroId)
        .subscribe({
          next: (response) => {
            this.libros = response.content as Libro[];
            this.paginador = response;
            console.log('Libros cargados:', this.libros.length);
          },
          error: (error) => {
            console.error('Error cargando los libros: ', error);
            this.libros = [];
            this.paginador = null;
          }
        });
    }
    // Si solo el filtro de autor está activo
    else if (this.selectedAutorId > 0) {
      console.log('Cargando libros por autor');
      this.libroService.getLibrosPorAutor(this.currentPage, this.currentPageSize, this.selectedAutorId)
        .subscribe({
          next: (response) => {
            this.libros = response.content as Libro[];
            this.paginador = response;
            console.log('Libros cargados:', this.libros.length);
          },
          error: (error) => {
            console.error('Error cargando los libros: ', error);
            this.libros = [];
            this.paginador = null;
          }
        });
    }
    // Si solo el filtro de género está activo
    else if (this.selectedGeneroId > 0) {
      console.log('Cargando libros por género específico:', this.selectedGeneroId, 'tipo:', typeof this.selectedGeneroId);
      
      // Asegurarse de que el ID del género sea un número
      const generoIdNum = Number(this.selectedGeneroId);
      if (isNaN(generoIdNum)) {
        console.error('El ID del género no es un número válido:', this.selectedGeneroId);
        // Cargar todos los libros si el ID no es válido
        this.libroService.getLibrosConTamanio(this.currentPage, this.currentPageSize)
          .subscribe({
            next: (response) => {
              this.libros = response.content as Libro[];
              this.paginador = response;
              console.log('Libros cargados (sin filtro):', this.libros.length);
            },
            error: (error) => {
              console.error('Error cargando los libros: ', error);
              this.libros = [];
              this.paginador = null;
            }
          });
      } else {
        this.libroService.getLibrosPorGenero(generoIdNum, this.currentPage, this.currentPageSize)
          .subscribe({
            next: (response) => {
              this.libros = response.content as Libro[];
              this.paginador = response;
              console.log('Libros cargados por género:', this.libros.length);
            },
            error: (error) => {
              console.error('Error cargando los libros: ', error);
              this.libros = [];
              this.paginador = null;
            }
          });
      }
    }
    // Si no hay filtros activos
    else {
      console.log('Cargando todos los libros sin filtros');
      this.libroService.getLibrosConTamanio(this.currentPage, this.currentPageSize)
        .subscribe({
          next: (response) => {
            this.libros = response.content as Libro[];
            this.paginador = response;
            console.log('Libros cargados:', this.libros.length);
          },
          error: (error) => {
            console.error('Error cargando los libros: ', error);
            this.libros = [];
            this.paginador = null;
          }
        });
    }
  }

  addToCart(libro: Libro): void {
    if (!this.authService.esUsuario) {
      swal('Error', 'Debes iniciar sesión para añadir libros al carrito', 'error');
      return;
    }

    this.carritoService.addToCart(libro).subscribe({
      next: () => {
        swal('Éxito', 'Libro añadido al carrito correctamente', 'success');
      },
      error: (err) => {
        console.error('Error al añadir al carrito:', err);
        swal('Error', 'No se pudo añadir el libro al carrito', 'error');
      }
    });
  }

  /**
   * Verifica si el usuario ha comprado un libro
   * @param libroId ID del libro
   * @returns true si el usuario ha comprado el libro, false en caso contrario
   */
  haCompradoLibro(libroId: number): boolean {
    if (!this.authService.estaLogueado()) {
      return false;
    }
    const usuarioId = this.authService.getCurrentUserId();
    return this.librosCompradosService.haCompradoLibro(usuarioId, libroId);
  }

  // Cargar géneros
  cargarGeneros(): void {
    this.generoService.getGeneros().subscribe({
      next: (generos) => {
        this.generos = generos;
      },
      error: (error) => {
        console.error('Error al cargar géneros:', error);
        this.generos = [];
      }
    });
  }
}