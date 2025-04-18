import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import swal from 'sweetalert2';
import { Autor } from '../autor/autor';
import { AutorService } from '../autor/autor.service';
import { AuthService } from '../login/auth.service';

@Component({
  selector: 'app-form-autor',
  standalone: false,
  templateUrl: './form-autor.component.html',
  styleUrl: './form-autor.component.css'
})
export class FormAutorComponent implements OnInit {

  public autor: Autor = new Autor();
  public errors: string[] = [];
  autores: Autor[] = [];

  constructor(
    private autorService: AutorService, 
    public router: Router, 
    private activatedRoute: ActivatedRoute,
    public authService: AuthService
  ) { }

  ngOnInit(): void {
    this.cargarAutor();
  }

  // Crear autor
  public create(): void {
    this.autorService.create(this.autor).subscribe(

      // Si OK
      json => {
        this.router.navigate(['/autores'])
        // Mensaje SweetAlert
        swal('Nuevo autor', `Autor ${json.autor.nombre} creado con éxito`, 'success');
      },

      // Si error
      err => {
        this.errors = err.error.errores as string[];
        console.error('Código del error (backend): ' + err.error.status);
        console.error(err.error.errores);
      }
    );
  }

  // Obtener autor por ID
  public cargarAutor(): void {
    this.activatedRoute.params.subscribe(params => {
      let id = params['id'];
      if(id) {
        this.autorService.getAutor(id).subscribe(
          (autor) => this.autor = autor
        );
      }
    });
  }

  // Update autor por ID
  public update(): void {
    this.autorService.updateAutor(this.autor).subscribe(

      // Si OK
      json => {
        this.router.navigate(['/autores'])
        //Mensaje
        swal('Autor Actualizado', `Autor ${json.autor.nombre} actualizado con éxito`, 'success');
      },

      // Si error
      err => {
        this.errors = err.error.errores as string[];
        console.error('Código del error (backend): ' + err.error.status);
        console.error(err.error.errores);
      }
    );
  }

  // Delete en autor.component.ts

}
