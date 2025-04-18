import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'paginator-nav',
  standalone: false,
  templateUrl: './paginator.component.html',
  styleUrl: './paginator.component.css'
})
export class PaginatorComponent implements OnInit, OnChanges {

  @Input()
  paginador: any;
  
  @Input()
  pageSize: number = 6; // Tamaño de página por defecto

  @Input()
  autorId: number = 0; // ID del autor seleccionado
  
  @Input()
  generoId: number = 0; // ID del género seleccionado
  
  @Input()
  routeBase: string = '/libros'; // Ruta base por defecto
  
  paginas: number[] = [];

  desde: number = 0;
  hasta: number = 0;

  constructor(private route: ActivatedRoute, private router: Router) {
    // Detectar la ruta actual para establecer la ruta base
    const currentUrl = this.router.url;
    if (currentUrl.includes('/valoraciones')) {
      this.routeBase = '/valoraciones';
    } else if (currentUrl.includes('/autores')) {
      this.routeBase = '/autores';
    }
  }

  ngOnInit(): void {
    // Obtener parámetros de consulta de la URL actual
    this.route.queryParams.subscribe(params => {
      const autorIdParam = params['autorId'];
      if (autorIdParam) {
        this.autorId = +autorIdParam;
      }
      
      const generoIdParam = params['generoId'];
      if (generoIdParam) {
        this.generoId = +generoIdParam;
      }
      
      const sizeParam = params['size'];
      if (sizeParam) {
        this.pageSize = +sizeParam;
      }
    });
  }

  ngOnChanges(): void {
    if (!this.paginador) {
      console.warn('Paginador es nulo o indefinido');
      return;
    }
    
    const pagesToShow = 4;  // Número máximo de páginas a mostrar
    const currentPage = this.paginador.number;
    const totalPages = this.paginador.totalPages;
  
    // Si hay más de 5 páginas
    if (totalPages > pagesToShow) {
      // Calcular el rango de páginas a mostrar
      this.desde = Math.max(1, currentPage - 2);  // Queremos 2 páginas antes y 2 después
      this.hasta = Math.min(totalPages, currentPage + 2);
  
      // Ajustar si el rango se sale de los límites
      if (currentPage <= 3) {
        this.hasta = Math.min(pagesToShow, totalPages);  // Si estamos cerca del principio
      } else if (currentPage + 2 >= totalPages) {
        this.desde = Math.max(1, totalPages - pagesToShow + 1);  // Si estamos cerca del final
      }
  
      // Crear el arreglo de páginas visibles
      this.paginas = new Array(this.hasta - this.desde + 1).fill(0).map((_valor, indice) => indice + this.desde);
    } else {
      // Si hay 5 o menos páginas, simplemente mostrar todas
      this.paginas = new Array(totalPages).fill(0).map((_valor, indice) => indice + 1);
    }
  }
  
  // Método para construir los parámetros de consulta
  getQueryParams(page: number): any {
    const params: any = { page: page };
    
    if (this.autorId > 0) {
      params.autorId = this.autorId;
    }
    
    if (this.generoId > 0) {
      params.generoId = this.generoId;
    }
    
    // Añadir el tamaño de página a los parámetros
    if (this.pageSize > 0) {
      params.size = this.pageSize;
    }
    
    return params;
  }
  
  // Obtener la ruta base para los enlaces de paginación
  getRouteBase(): string {
    return this.routeBase;
  }
}
