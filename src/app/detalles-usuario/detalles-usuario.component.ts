import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import swal from 'sweetalert2';
import { DetallesUsuarioService } from '../detalles-usuario/detalles-usuario.service';
import { Usuario } from '../usuario/usuario';
import { PedidoService } from '../pedido/pedido.service';
import { Pedido } from '../pedido/pedido';
import { Valoracion } from '../valoracion/valoracion';
import { ValoracionService } from '../valoracion/valoracion.service';
import { AuthService } from '../login/auth.service';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-detalles-usuario',
  standalone: false,
  templateUrl: './detalles-usuario.component.html',
  styleUrl: './detalles-usuario.component.css'
})
export class DetallesUsuarioComponent implements OnInit, OnDestroy {
 
  usuario: Usuario = new Usuario();
  pedidos: Pedido[] = [];
  valoraciones: Valoracion[] = [];
  esPerfilPropio: boolean = false;
  cargando: boolean = true;
  error: string = '';
  forceRefresh: boolean = false;
  pedidoExpandido: boolean[] = []; // Array para controlar qué pedidos están expandidos
  private routerSubscription: Subscription | undefined;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private usuarioService: DetallesUsuarioService,
    private pedidoService: PedidoService,
    private valoracionService: ValoracionService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.cargando = true;
    this.error = '';
   
    // Checkear si necesitamos refrescar los pedidos
    this.route.queryParams.subscribe(params => {
      const refresh = params['refresh'];
      if (refresh === 'true') {
        // Forzamos el resfresco con una flag
        this.forceRefresh = true;
      }
    });
   
    // Obtener el id del usuario desde la ruta
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
     
      // Verificar si el parámetro id es válido
      if (!idParam || isNaN(Number(idParam))) {
        console.log('ID de usuario no válido en la URL o no proporcionado, intentando usar el usuario actual');
       
        // Intentar usar el ID del usuario logueado
        const usuarioLogueadoId = this.authService.getCurrentUserId();
       
        if (usuarioLogueadoId && !isNaN(Number(usuarioLogueadoId))) {
          this.esPerfilPropio = true;
          this.cargarDatosUsuario(usuarioLogueadoId);
        } else {
          // Si no hay ID válido, intentar usar el email del usuario actual
          const email = this.authService.getCurrentUserEmail();
          if (email) {
            this.cargarDatosPorEmail(email);
          } else {
            // Si no hay email, mostrar error y redirigir
            this.cargando = false;
            this.error = 'No se pudo identificar al usuario';
            swal(
              'Error',
              this.error,
              'error'
            );
            this.router.navigate(['/principal']);
          }
        }
        return;
      }
     
      const usuarioId = Number(idParam);
     
      // Verificar si es el perfil del usuario logueado
      const usuarioLogueadoId = this.authService.getCurrentUserId();
      this.esPerfilPropio = usuarioId === usuarioLogueadoId;
     
      // Llamar al servicio para obtener el usuario por id
      this.cargarDatosUsuario(usuarioId);
    });

    // Suscribirse a los eventos de navegación
    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      // Recargar las valoraciones cuando se vuelve a la página
      if (this.usuario && this.usuario.id) {
        this.cargarValoraciones(this.usuario.id);
      }
    });
  }

  ngOnDestroy(): void {
    // Cancelar la suscripción cuando el componente se destruye
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  cargarDatosUsuario(usuarioId: number): void {
    this.cargando = true;
    this.error = '';
   
    if (!usuarioId || isNaN(usuarioId)) {
      console.error('ID de usuario no válido:', usuarioId);
      this.cargando = false;
      this.error = 'ID de usuario no válido';
      swal(
        'Error',
        this.error,
        'error'
      );
      this.router.navigate(['/principal']);
      return;
    }
   
    this.usuarioService.obtenerUsuarioPorId(usuarioId).subscribe(
      (usuario) => {
        this.usuario = usuario;
       
        // Inicializar las colecciones si no existen
        if (!this.usuario.pedidos) this.usuario.pedidos = [];
        if (!this.usuario.valoraciones) this.usuario.valoraciones = [];
       
        // Cargar los pedidos del usuario específico
        // If forceRefresh is true, we'll add a delay before loading the orders
        if (this.forceRefresh) {
          setTimeout(() => {
            this.cargarPedidos(usuarioId);
            // Reset the flag
            this.forceRefresh = false;
          }, 1000);
        } else {
          this.cargarPedidos(usuarioId);
        }
       
        // Cargar las valoraciones del usuario específico
        this.cargarValoraciones(usuarioId);
       
        this.cargando = false;
      },
      (error) => {
        console.error('Error al obtener los datos del usuario:', error);
        this.cargando = false;
        this.error = 'No se pudieron cargar los datos del usuario';
        swal(
          'Error',
          this.error,
          'error'
        );
        this.router.navigate(['/principal']);
      }
    );
  }

  cargarPedidos(usuarioId: number, intentos: number = 0): void {
    // Asegurarse de que los pedidos están inicializados
    if (!this.usuario.pedidos) {
      this.usuario.pedidos = [];
    }
   
    this.pedidoService.getPedidosPorUsuarioId(usuarioId).subscribe({
      next: (pedidos) => {
        // Checkear si los pedidos son null
        if (pedidos) {
          // Si el usuario tiene dirección, actualizar las direcciones de envío vacías o "Sin dirección especificada"
          if (this.usuario.direccion) {
            pedidos.forEach(pedido => {
              if (!pedido.direccionEnvio || pedido.direccionEnvio === 'Sin dirección especificada') {
                console.log(`Actualizando dirección de envío del pedido ID: ${pedido.id} con la dirección del usuario`);
                pedido.direccionEnvio = this.usuario.direccion;
              }
            });
          }
         
          this.usuario.pedidos = pedidos;
          // Inicializar el array de pedidos expandidos
          this.pedidoExpandido = new Array(pedidos.length).fill(false);
         
          if (pedidos.length === 0) {
            console.log('El usuario no tiene pedidos');
           
            // Si el primer intetno no ha ido bien probar despues de un delay
            if (intentos === 0) {
              console.log('Intentando cargar pedidos nuevamente en 2 segundos...');
              setTimeout(() => {
                this.cargarPedidos(usuarioId, intentos + 1);
              }, 2000);
            }
          } else {
            console.log(`Se encontraron ${pedidos.length} pedidos para el usuario`);
          }
        } else {
          console.warn('Los pedidos recibidos son nulos o indefinidos');
          this.usuario.pedidos = [];
          this.pedidoExpandido = [];
         
          if (intentos === 0) {
            console.log('Intentando cargar pedidos nuevamente en 2 segundos...');
            setTimeout(() => {
              this.cargarPedidos(usuarioId, intentos + 1);
            }, 2000);
          }
        }
      },
      error: (error) => {
        console.error('Error al obtener los pedidos del usuario:', error);
        // Array vacío en caso de error
        this.usuario.pedidos = [];
        this.pedidoExpandido = [];
       
        // Mensajes
        if (error.status === 404) {
          console.warn('El endpoint para obtener pedidos no existe o no está disponible');
        } else if (error.status === 403) {
          console.warn('No tienes permisos para ver los pedidos de este usuario');
        } else {
          console.warn('Error desconocido al cargar los pedidos');
        }

        if (intentos === 0) {
          setTimeout(() => {
            this.cargarPedidos(usuarioId, intentos + 1);
          }, 2000);
        }
      }
    });
  }

  cargarValoraciones(usuarioId: number): void {
    this.valoracionService.getValoracionesPorUsuarioId(usuarioId).subscribe({
      next: (valoraciones) => {
        if (!this.usuario.valoraciones) {
          this.usuario.valoraciones = [];
        }
        this.usuario.valoraciones = valoraciones;
      },
      error: (error) => {
        this.usuario.valoraciones = [];
      }
    });
  }

  cargarDatosPorEmail(email: string): void {
    this.cargando = true;
    this.error = '';
   
    this.usuarioService.obtenerUsuarioPorEmail(email).subscribe(
      (usuario) => {
        this.usuario = usuario;
       
        // Inicializar las colecciones si no existen
        if (!this.usuario.pedidos) this.usuario.pedidos = [];
        if (!this.usuario.valoraciones) this.usuario.valoraciones = [];
       
        // Marcar como perfil propio
        this.esPerfilPropio = true;
       
        // Cargar los pedidos y valoraciones
        if (this.usuario.id) {
          this.cargarPedidos(this.usuario.id);
          this.cargarValoraciones(this.usuario.id);
        }
       
        this.cargando = false;
       
        // Actualizar el ID en el servicio de autenticación
        const usuarioActual = this.authService.getCurrentUser();
        if (usuarioActual && this.usuario.id) {
          usuarioActual.id = this.usuario.id;
          localStorage.setItem('usuario', JSON.stringify(usuarioActual));
          // No actualizamos el subject para evitar un bucle infinito
        }
      },
      (error) => {
        this.cargando = false;
        this.error = 'No se pudieron cargar los datos del usuario';
       
        // Intentar usar los datos del usuario actual como alternativa
        const usuarioActual = this.authService.getCurrentUser();
        if (usuarioActual) {
          this.esPerfilPropio = true;
          this.usuario = this.convertirUsuarioAuth(usuarioActual);
        } else {
          swal(
            'Error',
            this.error,
            'error'
          );
          this.router.navigate(['/principal']);
        }
      }
    );
  }

  // Método helper para generar array de estrellas
  getStarsArray(puntuacion: number): number[] {
    return Array(puntuacion).fill(0);
  }

  // Método helper para generar array de estrellas vacías
  getEmptyStarsArray(puntuacion: number): number[] {
    return Array(5 - puntuacion).fill(0);
  }

  delete(usuario: Usuario): void {
    // Mensaje confirmacion eliminar
    swal({
      title: `¿Estás seguro de eliminar el usuario "${usuario.nombre} ${usuario.apellido}"?`,
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
        this.usuarioService.delete(usuario.id).subscribe(
          response => {
            this.router.navigate(['/usuarios']);
            swal(
              '¡Eliminado!',
              `El usuario "${usuario.nombre} ${usuario.apellido}" ha sido eliminado con éxito`,
              'success'
            );
          },
          error => {
            console.error('Error al eliminar el usuario:', error);
           
            // Mensaje específico para el caso de usuarios con pedidos asociados
            if (error.status === 409) { // 409 Conflict
              swal(
                'No se puede eliminar',
                'Este usuario no puede ser eliminado porque está asociado a uno o más pedidos.',
                'warning'
              );
            } else {
              swal(
                'Error al eliminar',
                error.error.mensaje || 'Ocurrió un error al intentar eliminar el usuario.',
                'error'
              );
            }
          }
        );
      } else if(result.dismiss === swal.DismissReason.cancel) {
        swal(
          'Cancelado',
          'Tu usuario está a salvo :)',
          'error'
        )
      }
    });
  }

  // Eliminar valoracion con confirmación
  deleteValoracion(valoracion: Valoracion): void {
    // Mensaje de confirmación de eliminación
    swal({
      title: `¿Estás seguro de eliminar la valoración?`,
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
            // Cuando la eliminación es exitosa, actualizamos la lista
            this.usuario.valoraciones = this.usuario.valoraciones.filter(v => v.id !== valoracion.id);
            swal(
              '¡Eliminado!',
              `La valoración ha sido eliminada con éxito`,
              'success'
            );
          },
          error => {
            console.error('Error al eliminar la valoración', error);
            swal(
              'Error',
              'Hubo un problema al eliminar la valoración',
              'error'
            );
          }
        );
      } else if (result.dismiss === swal.DismissReason.cancel) {
        swal(
          'Cancelado',
          'La valoración está a salvo :)',
          'error'
        );
      }
    });
  }

  // Método para convertir el usuario de autenticación a un objeto Usuario
  convertirUsuarioAuth(usuarioAuth: any): Usuario {
    const usuario = new Usuario();
    usuario.id = usuarioAuth.id || 0;
    usuario.email = usuarioAuth.email || '';
    usuario.nombre = usuarioAuth.username || usuarioAuth.email?.split('@')[0] || '';
    usuario.apellido = '';
    usuario.rol = usuarioAuth.rol || 'USER';
    usuario.pedidos = [];
    usuario.valoraciones = [];
    return usuario;
  }

  // Método para alternar la visibilidad de los detalles de un pedido
  toggleDetallesPedido(index: number): void {
    if (index >= 0 && index < this.pedidoExpandido.length) {
      this.pedidoExpandido[index] = !this.pedidoExpandido[index];
     
      // Si estamos expandiendo el pedido
      if (this.pedidoExpandido[index] && this.usuario.pedidos[index]) {
        // Verificar si la dirección de envío está vacía o es "Sin dirección especificada"
        if (!this.usuario.pedidos[index].direccionEnvio ||
            this.usuario.pedidos[index].direccionEnvio === 'Sin dirección especificada') {
          // Si el usuario tiene dirección, usarla como dirección de envío
          if (this.usuario.direccion) {
            this.usuario.pedidos[index].direccionEnvio = this.usuario.direccion;
          }
        }
       
        // Si no tiene detalles cargados, intentamos cargarlos
        if (!this.usuario.pedidos[index].detalles || this.usuario.pedidos[index].detalles.length === 0) {
          const pedidoId = this.usuario.pedidos[index].id;
          if (pedidoId) {
            // Verificar si ya tenemos los detalles en el pedido
            if (this.usuario.pedidos[index].detalles && this.usuario.pedidos[index].detalles.length > 0) {
              return;
            }
           
            // Usar el nuevo método para obtener un pedido específico por ID
            this.pedidoService.getPedidoPorId(pedidoId).subscribe({
              next: (pedidoActualizado) => {
                if (pedidoActualizado && pedidoActualizado.detalles && pedidoActualizado.detalles.length > 0) {
                  // Actualizar solo los detalles del pedido específico
                  this.usuario.pedidos[index].detalles = pedidoActualizado.detalles;
                 
                  // Si la dirección de envío del pedido actualizado está vacía o es "Sin dirección especificada"
                  // y el usuario tiene dirección, actualizarla
                  if ((!pedidoActualizado.direccionEnvio ||
                      pedidoActualizado.direccionEnvio === 'Sin dirección especificada') &&
                      this.usuario.direccion) {
                    this.usuario.pedidos[index].direccionEnvio = this.usuario.direccion;
                  } else {
                    // Mantener la dirección de envío del pedido actualizado
                    this.usuario.pedidos[index].direccionEnvio = pedidoActualizado.direccionEnvio;
                  }
                } else {
                  console.warn(`No se encontraron detalles para el pedido ID: ${pedidoId}`);
                }
              },
              error: (error) => {
                console.error(`Error al cargar los detalles del pedido ID: ${pedidoId}`, error);
                // Si hay un error al obtener el pedido específico, intentamos con el método anterior
                this.pedidoService.getPedidosPorUsuarioId(this.usuario.id!).subscribe({
                  next: (pedidos) => {
                    if (pedidos && pedidos.length > 0) {
                      // Buscar el pedido específico por ID
                      const pedidoEncontrado = pedidos.find(p => p.id === pedidoId);
                      if (pedidoEncontrado && pedidoEncontrado.detalles && pedidoEncontrado.detalles.length > 0) {
                        // Actualizar solo los detalles del pedido específico
                        this.usuario.pedidos[index].detalles = pedidoEncontrado.detalles;
                       
                        // Si la dirección de envío del pedido encontrado está vacía o es "Sin dirección especificada"
                        // y el usuario tiene dirección, actualizarla
                        if ((!pedidoEncontrado.direccionEnvio ||
                            pedidoEncontrado.direccionEnvio === 'Sin dirección especificada') &&
                            this.usuario.direccion) {
                          this.usuario.pedidos[index].direccionEnvio = this.usuario.direccion;
                        } else {
                          // Mantener la dirección de envío del pedido encontrado
                          this.usuario.pedidos[index].direccionEnvio = pedidoEncontrado.direccionEnvio;
                        }
                      } else {
                        console.warn(`No se encontraron detalles para el pedido ID: ${pedidoId}`);
                      }
                    }
                  },
                  error: (error) => {
                    console.error(`Error al cargar los detalles del pedido ID: ${pedidoId}`, error);
                  }
                });
              }
            });
          }
        }
      }
    }
  }
  tieneValoracion(libroId: number): boolean {
    if (!this.usuario?.valoraciones) {
      return false;
    }
   
    return this.usuario.valoraciones.some(v =>
    (typeof v.libroDetalles === 'number' && v.libroDetalles === libroId) ||
    (v.libro && v.libro.id === libroId)
    )
  }
}