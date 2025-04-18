import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import swal from 'sweetalert2';
import { Libro } from '../libro/libro';
import { LibroService } from '../libro/libro.service';
import { Autor } from '../autor/autor';
import { AutorService } from '../autor/autor.service';
import { GeneroService } from '../generos/generos.service';
import { Genero } from '../generos/generos';
import { AuthService } from '../login/auth.service';

@Component({
  selector: 'app-form-libro',
  standalone: false,
  templateUrl: './form-libro.component.html',
  styleUrl: './form-libro.component.css'
})
export class FormLibroComponent implements OnInit {

  public libro: Libro = new Libro();
  public errors: string[] = [];
  autores: Autor[] = [];
  generos: Genero[] = [];
  autorSeleccionado: Autor = new Autor();
  generoSeleccionado: Genero = new Genero();
  imagenPreview: string | null = null;
  selectedFile: File | null = null;

  constructor(
    private libroService: LibroService, 
    public router: Router, 
    private activatedRoute: ActivatedRoute,
    private autorService: AutorService,
    private generoService: GeneroService,
    public authService: AuthService
  ) { }

  ngOnInit(): void {
    // Inicializar ids como 0 para que se seleccionen las opciones por defecto
    this.autorSeleccionado.id = 0;
    this.generoSeleccionado.id = 0;
    
    this.cargarLibro();
    this.cargarAutores();
    this.cargarGeneros();
    
    // Inicializar arrays si están vacíos
    if (!this.libro.autores) {
      this.libro.autores = [];
    }

    if (!this.libro.generos) {
      this.libro.generos = [];
    }
  }

  // Crear libro
  public create(): void {
    // Si hay un archivo seleccionado, convertirlo a base64 antes de enviar
    if (this.selectedFile) {
      this.convertFileToBase64(this.selectedFile).then(base64 => {
        this.libro.imagen = base64;
        this.saveLibro();
      }).catch(error => {
        console.error('Error al convertir la imagen:', error);
        this.errors.push('Error al procesar la imagen');
      });
    } else {
      this.saveLibro();
    }
  }

  private saveLibro(): void {
    // Asignar el autor y género seleccionados al libro
    if (this.autorSeleccionado && this.autorSeleccionado.id !== 0) {
      this.libro.autores = [this.autorSeleccionado];
    }
    if (this.generoSeleccionado && this.generoSeleccionado.id !== 0) {
      this.libro.generos = [this.generoSeleccionado];
    }

    this.libroService.create(this.libro).subscribe({
      next: (response) => {
        swal(
          'Nuevo libro',
          `El libro ${this.libro.titulo} ha sido creado con éxito`,
          'success'
        );
        this.router.navigate(['/libros']);
      },
      error: (err) => {
        this.errors = err.error.errors as string[];
        console.error('Código de error desde el backend: ' + err.status);
        console.error(err.error.errors);
      }
    });
  }

  // Obtener libro por ID
  public cargarLibro(): void {
    this.activatedRoute.params.subscribe(params => {
      let id = params['id'];
      if(id) {
        this.libroService.getLibro(id).subscribe(
          (libro) => {
            this.libro = libro;
            // Si el libro tiene autores, seleccionar el primero
            if (this.libro.autores && this.libro.autores.length > 0) {
              this.autorSeleccionado = this.libro.autores[0];
            }
            // Si el libro tiene géneros, seleccionar el primero
            if (this.libro.generos && this.libro.generos.length > 0) {
              this.generoSeleccionado = this.libro.generos[0];
            }
          }
        );
      }
    });
  }

  // Update libro por ID
  public update(): void {
    // Si hay un archivo seleccionado, convertirlo a base64 antes de enviar
    if (this.selectedFile) {
      this.convertFileToBase64(this.selectedFile).then(base64 => {
        this.libro.imagen = base64;
        this.updateLibro();
      }).catch(error => {
        console.error('Error al convertir la imagen:', error);
        this.errors.push('Error al procesar la imagen');
      });
    } else {
      this.updateLibro();
    }
  }

  private updateLibro(): void {
    // Asignar el autor y género seleccionados al libro
    if (this.autorSeleccionado && this.autorSeleccionado.id !== 0) {
      this.libro.autores = [this.autorSeleccionado];
    }
    if (this.generoSeleccionado && this.generoSeleccionado.id !== 0) {
      this.libro.generos = [this.generoSeleccionado];
    }

    this.libroService.updateLibro(this.libro).subscribe({
      next: (json) => {
        swal(
          'Libro Actualizado',
          `${json.mensaje}: ${json.libro.titulo}`,
          'success'
        );
        this.router.navigate(['/libros']);
      },
      error: (err) => {
        this.errors = err.error.errors as string[];
        console.error('Código de error desde el backend: ' + err.status);
        console.error(err.error.errors);
      }
    });
  }

  // Obtener autores
  public cargarAutores(): void {
    this.autorService.getAutores().subscribe(
      (autores) => {
        this.autores = autores;
      },
      (err) => {
        console.error('Error al cargar los autores', err);
      }
    );
  }

  // Obtener géneros
  public cargarGeneros(): void {
    this.generoService.getGeneros().subscribe(
      (generos) => {
        this.generos = generos;
      },
      (err) => {
        console.error("Error al cargar los géneros", err);
      },
    );
  }
  
  // Seleccionar autor
  public seleccionarAutor(event: any): void {
    const autorId = event.target.value;
    if (autorId === 'crearAutor') {
      this.router.navigate(['/autor/form']);
    } else if (autorId === '0') {
      // Cuando se selecciona la opción predeterminada, reiniciar el autor seleccionado
      this.autorSeleccionado = new Autor();
      this.autorSeleccionado.id = 0;
    } else {
      this.autorSeleccionado = this.autores.find(autor => autor.id.toString() === autorId) || new Autor();
    }
  }

  // Seleccionar género
  public seleccionarGenero(event: any): void {
    const generoId = event.target.value;
    if (generoId === 'crearGenero') {
      this.router.navigate(['/genero/form']);
    } else if (generoId === '0') {
      // Cuando se selecciona la opción predeterminada, reiniciar el género seleccionado
      this.generoSeleccionado = new Genero();
      this.generoSeleccionado.id = 0;
    } else {
      this.generoSeleccionado = this.generos.find(genero => genero.id.toString() === generoId) || new Genero();
    }
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
