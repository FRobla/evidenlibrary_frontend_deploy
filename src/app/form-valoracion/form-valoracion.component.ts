import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import swal from 'sweetalert2';
import { Valoracion } from '../valoracion/valoracion';
import { ValoracionService } from '../valoracion/valoracion.service';
import { Usuario } from '../usuario/usuario';
import { UsuarioService } from '../usuario/usuario.service';
import { Libro } from '../libro/libro';
import { LibroService } from '../libro/libro.service';
import { AuthService } from '../login/auth.service';

@Component({
  selector: 'app-form-valoracion',
  standalone: false,
  templateUrl: './form-valoracion.component.html',
  styleUrl: './form-valoracion.component.css'
})
export class FormValoracionComponent implements OnInit {

  public valoracion: Valoracion = new Valoracion();
  public errors: string[] = [];
  public usuarios: Usuario[] = [];
  public libros: Libro[] = [];
  // Mapa para almacenar valoraciones por usuario 
  public valoracionesPorUsuario: Map<number, Valoracion[]> = new Map();

  constructor(
    private valoracionService: ValoracionService,
    private usuarioService: UsuarioService,
    private libroService: LibroService,
    public router: Router,
    private activatedRoute: ActivatedRoute,
    public authService: AuthService
  ) { }

  ngOnInit(): void {
    // Si es admin, cargar todos los usuarios y libros
    if (this.authService.esAdmin) {
      this.cargarUsuarios();
      this.cargarLibros();
    } else {
      // Si es usuario normal, obtener los datos completos del usuario actual
      const usuarioId = this.authService.getCurrentUserId();
      if (usuarioId) {
        this.usuarioService.getUsuario(usuarioId).subscribe(
          usuario => {
            this.valoracion.usuario = usuario;
          },
          error => {
            console.error('Error al cargar datos del usuario:', error);
            // Como fallback, usar el usuario del authService
            this.valoracion.usuario = this.authService.usuarioLogueado;
          }
        );
      } else {
        // Si no hay ID, usar el usuario del authService como fallback
        this.valoracion.usuario = this.authService.usuarioLogueado;
      }
    }

    // Obtener el libroId de los query params
    this.activatedRoute.queryParams.subscribe(params => {
      const libroId = params['libroId'];
      if (libroId) {
        if (this.authService.esAdmin) {
          // Si es admin, el libro ya estará en la lista cargada
          const libroEncontrado = this.libros.find(l => l.id === +libroId);
          if (libroEncontrado) {
            this.valoracion.libro = libroEncontrado;
            this.valoracion.libroDetalles = libroEncontrado.id;
          }
        } else {
          // Si es usuario normal, cargar solo el libro específico
          this.cargarLibro(+libroId);
        }
      }
    });

    // Si hay un ID en la ruta, cargar la valoración para editar
    this.activatedRoute.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.cargarValoracion(id);
      }
    });
  }

  // Cargar todos los usuarios (solo para admin)
  cargarUsuarios(): void {
    this.usuarioService.getUsuarios().subscribe(
      usuarios => {
        this.usuarios = usuarios;
      },
      error => {
        console.error('Error al cargar usuarios', error);
        swal('Error', 'No se pudieron cargar los usuarios', 'error');
      }
    );
  }

  // Cargar todos los libros (solo para admin)
  cargarLibros(): void {
    this.libroService.getLibrosNoPagin().subscribe(
      libros => {
        this.libros = libros;
      },
      error => {
        console.error('Error al cargar libros', error);
        swal('Error', 'No se pudieron cargar los libros', 'error');
      }
    );
  }

  // Cargar libro específico (para usuario normal)
  cargarLibro(id: number): void {
    this.libroService.getLibro(id).subscribe(
      libro => {
        this.valoracion.libro = libro;
        this.valoracion.libroDetalles = libro.id;
      },
      error => {
        console.error('Error al cargar el libro', error);
        swal('Error', 'No se pudo cargar el libro seleccionado', 'error');
        this.router.navigate(['/libros']);
      }
    );
  }

  // Obtener valoración por ID (para edición)
  cargarValoracion(id: number): void {
    this.valoracionService.getValoracion(id).subscribe(
      valoracion => {
        this.valoracion = valoracion;
       
        // Si tenemos libroDetalles pero no libro, cargar el libro
        if (this.valoracion.libroDetalles && !this.valoracion.libro) {
          const libroId = typeof this.valoracion.libroDetalles === 'number'
            ? this.valoracion.libroDetalles
            : (this.valoracion.libroDetalles as any).id;
           
          if (this.authService.esAdmin) {
            const libroEncontrado = this.libros.find(l => l.id === libroId);
            if (libroEncontrado) {
              this.valoracion.libro = libroEncontrado;
            }
          } else {
            this.cargarLibro(libroId);
          }
        }
      },
      error => {
        console.error('Error al cargar valoración', error);
        swal('Error', 'No se pudo cargar la valoración', 'error');
        this.router.navigate(['/valoraciones']);
      }
    );
  }

  // Crear valoración
  public create(): void {

    if (!this.valoracion.usuario) {
      swal('Error', 'Debe seleccionar un usuario para crear la valoración', 'error');
      return;
    }
    
    if (!this.valoracion.usuario || !this.valoracion.libro) {
      swal('Error', 'Faltan datos requeridos', 'error');
      return;
    }

    if (!this.valoracion.libro) {
      swal('Error', 'Debe seleccionar un libro para crear la valoración', 'error');
      return;
    }

    // Verificar si el usuario ya ha valorado este libro
    if (this.usuarioYaValoroLibro(this.valoracion.usuario.id, this.valoracion.libro.id)) {
      swal('Error', `El usuario ${this.valoracion.usuario.nombre} ya ha valorado este libro anteriormente. Solo puede valorar un libro una vez.`, 'error');
      return;
    }

    // Actualizar la fecha actual
    this.valoracion.fecha = new Date();
   
    this.valoracionService.create(this.valoracion).subscribe(
      response => {
        this.router.navigate(['/valoraciones']);
        swal('Nueva valoración', `Valoración para el libro "${this.valoracion.libro?.titulo}" creada con éxito`, 'success');
      },
      err => {
        if (err.error.mensaje && err.error.mensaje.includes("ya ha valorado este libro")) {
          swal('Error', 'Ya has valorado este libro anteriormente. Solo puedes valorar un libro una vez.', 'error');
        } else {
          this.errors = err.error.errores as string[];
          console.error('Código del error (backend): ' + err.error.status);
          console.error(err.error.errores);
          swal('Error', `${err.error.mensaje || 'Error al crear la valoración'}`, 'error');
        }
      }
    );
  }

  // Actualizar valoración
  update(): void {
    if (!this.valoracion.usuario || !this.valoracion.libro) {
      swal('Error', 'Faltan datos requeridos', 'error');
      return;
    }

    this.valoracionService.updateValoracion(this.valoracion).subscribe(
      response => {
        this.router.navigate(['/valoraciones']);
        swal('Valoración Actualizada', 'La valoración se ha actualizado con éxito', 'success');
      },
      err => {
        this.errors = err.error.errores as string[];
        console.error('Error al actualizar valoración:', err);
      }
    );
  }

  // Establecer puntuación
  setRating(rating: number): void {
    this.valoracion.puntuacion = rating;
  }

  // Al cambiar el libro (solo para admin)
  onLibroChange(): void {
    if (this.valoracion.libro) {
      // Verificar si el usuario ya ha valorado este libro (solo si hay un usuario seleccionado)
      if (this.valoracion.usuario && this.usuarioYaValoroLibro(this.valoracion.usuario.id, this.valoracion.libro.id)) {
        swal('Aviso', `El usuario ${this.valoracion.usuario.nombre} ya ha valorado este libro anteriormente. Solo puede valorar un libro una vez.`, 'warning');
      }
      
      this.valoracion.libroDetalles = this.valoracion.libro.id;
    }
  }

  // Al cambiar el usuario
  onUsuarioChange(): void {
    if (this.valoracion.usuario) {
      // Cargar valoraciones del usuario seleccionado
      this.cargarValoracionesUsuario(this.valoracion.usuario.id);
      
      // Verificar si el usuario ya ha valorado este libro (solo si hay un libro seleccionado)
      if (this.valoracion.libro && this.usuarioYaValoroLibro(this.valoracion.usuario.id, this.valoracion.libro.id)) {
        swal('Aviso', `El usuario ${this.valoracion.usuario.nombre} ya ha valorado este libro anteriormente. Solo puede valorar un libro una vez.`, 'warning');
      }
    }
  }

  //Cargar valoraciones del usuario actual
  cargarValoracionesUsuario(usuarioId: number) : void {
    // Evitar cargar valoraciones de usuario que ya tenemos
    if (this.valoracionesPorUsuario.has(usuarioId)) {
      return;
    }
    
    this.valoracionService.getValoracionesPorUsuarioId(usuarioId).subscribe(
      valoraciones => {
        this.valoracionesPorUsuario.set(usuarioId, valoraciones);
      },
      error => {
        console.error(`Error al cargar valoraciones del usuario ${usuarioId}`, error);
      }
    );
  }

  // Verificar si el usuario ya ha valorado este libro
  usuarioYaValoroLibro(usuarioId: number, libroId: number): boolean {
    if (!this.valoracionesPorUsuario.has(usuarioId)) {
      return false; // No tenemos datos de este usuario todavía
    }
    
    const valoracionesUsuario = this.valoracionesPorUsuario.get(usuarioId) || [];
    return valoracionesUsuario.some(v => 
      // Verificamos si libroDetalles es un número o un objeto
      (typeof v.libroDetalles === 'number' && v.libroDetalles === libroId) || 
      (v.libro && v.libro.id === libroId)
    );
  }
}
