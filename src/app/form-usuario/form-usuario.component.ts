import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Usuario } from '../usuario/usuario';
import { UsuarioService } from '../usuario/usuario.service';
import { AuthService } from '../login/auth.service';
import swal from 'sweetalert2';

@Component({
  selector: 'app-form-usuario',
  standalone: false,
  templateUrl: './form-usuario.component.html',
  styleUrl: './form-usuario.component.css'
})
export class FormUsuarioComponent implements OnInit {
  
  public usuario: Usuario = new Usuario();
  public errors: string[] = [];
  public confirmPassword: string = '';
  public tienePermiso: boolean = false;
  imagenPreview: string | null = null;
  selectedFile: File | null = null;

  constructor(
    private usuarioService: UsuarioService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    public authService: AuthService
  ) { }

  ngOnInit(): void {
    this.cargarUsuario();
  }

  public cargarUsuario(): void {
    this.activatedRoute.params.subscribe(params => {
      let id = params['id'];
      if (id) {
        this.usuarioService.getUsuario(id).subscribe(
          (usuario) => {
            this.usuario = usuario;
            // Verificar si el usuario tiene permiso para editar
            const usuarioActual = this.authService.getCurrentUser();
            this.tienePermiso = this.authService.esAdmin || 
                              (usuarioActual && usuarioActual.id === this.usuario.id);
            
            if (!this.tienePermiso) {
              swal('Acceso Denegado', 'No tiene permisos para editar este perfil', 'error')
                .then(() => {
                  this.router.navigate(['/usuarios']);
                });
            }
          },
          error => {
            console.error('Error al cargar el usuario:', error);
            this.errors.push('Error al cargar los datos del usuario');
            this.router.navigate(['/usuarios']);
          }
        );
      }
    });
  }

  public update(): void {
    // Si hay un archivo seleccionado, convertirlo a base64 antes de enviar
    if (this.selectedFile) {
      this.convertFileToBase64(this.selectedFile).then(base64 => {
        this.usuario.foto = base64;
        this.updateUsuario();
      }).catch(error => {
        console.error('Error al convertir la imagen:', error);
        this.errors.push('Error al procesar la imagen');
      });
    } else {
      this.updateUsuario();
    }
  }

  private updateUsuario(): void {
    this.usuarioService.update(this.usuario).subscribe({
      next: (json) => {
        // Actualizar la información del usuario en el localStorage
        const usuarioActualizado = json.usuario;
        const usuarioGuardado = localStorage.getItem('usuario');
        
        if (usuarioGuardado) {
          try {
            const usuarioActual = JSON.parse(usuarioGuardado);
            // Actualizar solo los campos que pueden cambiar en el formulario
            usuarioActual.nombre = usuarioActualizado.nombre;
            usuarioActual.apellido = usuarioActualizado.apellido;
            usuarioActual.direccion = usuarioActualizado.direccion;
            usuarioActual.email = usuarioActualizado.email;
            usuarioActual.foto = usuarioActualizado.foto;
            
            // Guardar el usuario actualizado en el localStorage
            localStorage.setItem('usuario', JSON.stringify(usuarioActual));
          } catch (error) {
            console.error('Error al actualizar el usuario en localStorage:', error);
          }
        }
        
        swal(
          'Usuario Actualizado',
          `${json.mensaje}: ${json.usuario.nombre}`,
          'success'
        );
        this.router.navigate(['/usuario', this.usuario.id]);
      },
      error: (err) => {
        this.errors = err.error.errors as string[];
        console.error('Código de error desde el backend: ' + err.status);
        console.error(err.error.errors);
      }
    });
  }

  // Método para manejar la selección de archivos
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      
      // Crear una vista previa de la imagen
      const reader = new FileReader();
      reader.onload = () => {
        this.imagenPreview = reader.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  // Método para convertir un archivo a base64
  private convertFileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}
