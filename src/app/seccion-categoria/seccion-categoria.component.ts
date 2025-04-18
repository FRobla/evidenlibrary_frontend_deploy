import { Component, OnInit } from '@angular/core';
import { LibroService } from '../libro/libro.service';
import { Router } from '@angular/router';
import swal from 'sweetalert2';
import { Libro } from '../libro/libro';
import { Genero } from '../generos/generos';
import { AuthService } from '../login/auth.service';
import { LibrosCompradosService } from '../services/libros-comprados.service';
import { GeneroService } from '../generos/generos.service';

@Component({
  selector: 'app-seccion-categoria',
  standalone: false,
  templateUrl: './seccion-categoria.component.html',
  styleUrl: './seccion-categoria.component.css'
})
export class SeccionCategoriaComponent implements OnInit {
  // Los géneros que quieres mostrar
  generosMostrados: string[] = ['Fantasía', 'Autoayuda', 'Misterio'];
  
  // Estructura para almacenar libros por género
  librosPorGenero: Map<string, Libro[]> = new Map();
  
  // Mapa para almacenar los IDs de los géneros por nombre
  generoIdPorNombre: Map<string, number> = new Map();
  
  // Número máximo de libros a mostrar por género/columna
  maxLibrosPorColumna: number = 3;
  
  // Variables para manejar la carga
  loading: boolean = true;
  error: boolean = false;

  constructor(
    private libroService: LibroService,
    private router: Router,
    public authService: AuthService,
    private librosCompradosService: LibrosCompradosService,
    private generoService: GeneroService
  ) {}

  ngOnInit(): void {
    // Cargar el mapa de IDs de géneros
    this.cargarIdsGeneros();
    
    // Si el usuario está logueado, cargamos sus libros comprados
    if (this.authService.estaLogueado()) {
      const usuarioId = this.authService.getCurrentUserId();
      this.librosCompradosService.cargarLibrosComprados(usuarioId).subscribe(
        () => this.cargarLibros()
      );
    } else {
      this.cargarLibros();
    }
  }

  cargarIdsGeneros(): void {
    console.log('Cargando IDs de géneros...');
    this.generoService.getGeneros().subscribe({
      next: (generos) => {
        // Crear un mapa de nombre de género a ID
        this.generoIdPorNombre.clear(); // Limpiar el mapa existente
        
        generos.forEach(genero => {
          // Guardar tanto la versión original como la mayúscula para facilitar la búsqueda
          if (genero.nombre) {
            // Guardamos con el nombre original
            this.generoIdPorNombre.set(genero.nombre, genero.id);
            
            // También guardamos la versión en minúsculas para casos mixtos
            const nombreMinusculas = genero.nombre.toLowerCase();
            if (nombreMinusculas !== genero.nombre) {
              this.generoIdPorNombre.set(nombreMinusculas, genero.id);
            }
            
            // Y en mayúsculas (que es como suele venir del backend)
            const nombreMayusculas = genero.nombre.toUpperCase();
            if (nombreMayusculas !== genero.nombre) {
              this.generoIdPorNombre.set(nombreMayusculas, genero.id);
            }
          }
        });
        
        console.log('IDs de géneros cargados:', Array.from(this.generoIdPorNombre.entries()));
        
        // Verificación adicional para el género "Fantasía"
        const idFantasia = this.generoIdPorNombre.get('Fantasía') || 
                           this.generoIdPorNombre.get('FANTASÍA') || 
                           this.generoIdPorNombre.get('fantasía');
        console.log('ID para Fantasía:', idFantasia);
      },
      error: (err) => {
        console.error('Error al cargar géneros:', err);
      }
    });
  }

  cargarLibros(): void {
    this.loading = true;
    
    this.libroService.getLibrosNoPagin().subscribe({
      next: (libros) => {
        this.procesarLibrosPorGenero(libros);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar los libros:', err);
        swal('Error', 'No se pudieron cargar los libros. Por favor, intente más tarde.', 'error');
        this.loading = false;
        this.error = true;
      }
    });
  }

  procesarLibrosPorGenero(libros: Libro[]): void {
    // Inicializar el mapa para cada género que queremos mostrar
    this.generosMostrados.forEach(genero => {
      this.librosPorGenero.set(genero, []);
    });
    
    // Clasificar los libros según sus géneros
    libros.forEach(libro => {
      if (libro.generos && libro.generos.length > 0) {
        libro.generos.forEach((genero: Genero) => {
          // Verificar si es uno de los géneros que queremos mostrar
          if (this.generosMostrados.includes(genero.nombre)) {
            const librosGenero = this.librosPorGenero.get(genero.nombre) || [];
            
            // Evitar duplicados y limitar a maxLibrosPorColumna
            if (!librosGenero.find(l => l.id === libro.id) && librosGenero.length < this.maxLibrosPorColumna) {
              librosGenero.push(libro);
              this.librosPorGenero.set(genero.nombre, librosGenero);
            }
          }
        });
      }
    });
    
    // Si queremos seleccionar 4 libros aleatorios por género en lugar de los primeros 4
    this.generosMostrados.forEach(genero => {
      const todosLosLibrosGenero = this.librosPorGenero.get(genero) || [];
      if (todosLosLibrosGenero.length > this.maxLibrosPorColumna) {
        const librosAleatorios = this.seleccionarLibrosAleatorios(todosLosLibrosGenero, this.maxLibrosPorColumna);
        this.librosPorGenero.set(genero, librosAleatorios);
      }
    });
  }
  
  seleccionarLibrosAleatorios(libros: Libro[], cantidad: number): Libro[] {
    const librosCopiados = [...libros];
    const resultado: Libro[] = [];
    
    // Seleccionar aleatoriamente libros hasta alcanzar la cantidad deseada o agotar la lista
    while (resultado.length < cantidad && librosCopiados.length > 0) {
      const indiceAleatorio = Math.floor(Math.random() * librosCopiados.length);
      resultado.push(librosCopiados.splice(indiceAleatorio, 1)[0]);
    }
    
    return resultado;
  }

  verDetallesLibro(libroId: number): void {
    this.router.navigate(['/libro', libroId]);
  }
  
  // Método para navegar a la página de libros filtrada por género
  verLibrosPorGenero(genero: string): void {
    console.log('Navegando a libros por género:', genero);
    console.log('Mapa de géneros:', Array.from(this.generoIdPorNombre.entries()));
    
    // Lookup directo para géneros conocidos (solución temporal)
    const generoLookup: {[key: string]: number} = {
      'Fantasía': 2,
      'Autoayuda': 8,
      'Misterio': 4
    };
    
    // Verificar si es uno de los géneros conocidos
    if (generoLookup[genero]) {
      const generoId = generoLookup[genero];
      console.log('Género encontrado en lookup directo:', genero, 'ID:', generoId);
      this.router.navigate(['/libros'], {
        queryParams: {
          generoId: generoId,
          page: 0,
          size: 8
        }
      });
      return;
    }
    
    // Si el mapa está vacío, cargar los géneros primero
    if (this.generoIdPorNombre.size === 0) {
      console.log('Cargando géneros antes de navegar...');
      this.generoService.getGeneros().subscribe({
        next: (generos) => {
          // Crear un mapa de nombre de género a ID
          generos.forEach(genero => {
            this.generoIdPorNombre.set(genero.nombre, genero.id);
          });
          console.log('IDs de géneros cargados:', Array.from(this.generoIdPorNombre.entries()));
          // Ahora intentar navegar de nuevo
          this.navegarConGenero(genero);
        },
        error: (err) => {
          console.error('Error al cargar géneros:', err);
          this.router.navigate(['/libros']); // Navegación de fallback
        }
      });
    } else {
      // El mapa ya está cargado, navegar directamente
      this.navegarConGenero(genero);
    }
  }
  
  // Método auxiliar para navegar con el género
  private navegarConGenero(genero: string): void {
    // Convertir el género a mayúsculas para buscar en el mapa
    const generoUpperCase = genero.toUpperCase();
    console.log('Buscando género (en mayúsculas):', generoUpperCase);
    console.log('Mapa de géneros actual:', Array.from(this.generoIdPorNombre.entries()));
    
    // Intentar encontrar el ID primero con el nombre original y luego con mayúsculas
    let generoId = this.generoIdPorNombre.get(genero) || this.generoIdPorNombre.get(generoUpperCase);
    console.log('GeneroId encontrado:', generoId);
    
    if (generoId) {
      console.log('Navegando a /libros con queryParams:', { generoId, page: 0, size: 8 });
      this.router.navigate(['/libros'], {
        queryParams: {
          generoId: generoId,
          page: 0,
          size: 8 // Tamaño de página por defecto
        }
      });
    } else {
      console.error(`No se encontró el ID para el género: ${genero}`);
      
      // Buscar el género por nombre independientemente de mayúsculas/minúsculas
      this.generoService.getGeneros().subscribe(generos => {
        // Buscar ignorando mayúsculas/minúsculas
        const generoEncontrado = generos.find(g => 
          g.nombre.toUpperCase() === generoUpperCase ||
          g.nombre === genero
        );
        
        if (generoEncontrado) {
          console.log('Género encontrado por búsqueda directa:', generoEncontrado);
          this.router.navigate(['/libros'], {
            queryParams: {
              generoId: generoEncontrado.id,
              page: 0,
              size: 8
            }
          });
        } else {
          console.error(`No se pudo encontrar el género: ${genero}`);
          this.router.navigate(['/libros']);
        }
      });
    }
  }
  
  // Método útil para el template para obtener los libros de un género específico
  getLibrosPorGenero(genero: string): Libro[] {
    return this.librosPorGenero.get(genero) || [];
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
}