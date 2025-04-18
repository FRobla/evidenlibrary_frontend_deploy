import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import swal from 'sweetalert2';
import { Genero } from '../generos/generos';
import { GeneroService } from '../generos/generos.service';
import { AuthService } from '../login/auth.service';

@Component({
  selector: 'app-form-genero',
  standalone: false,
  templateUrl: './form-genero.component.html',
  styleUrl: './form-genero.component.css'
})
export class FormGeneroComponent implements OnInit {

  public genero: Genero = new Genero();
  public errors: string[] = [];
  generos: Genero[] = [];

  constructor(
    private generoService: GeneroService, 
    public router: Router, 
    private activatedRoute: ActivatedRoute,
    public authService: AuthService
  ) { }

  ngOnInit(): void {
    this.cargarGenero();
  }

  // Crear genero
  public create(): void {
    this.generoService.create(this.genero).subscribe(

      // Si OK
      json => {
        this.router.navigate(['/generos'])
        // Mensaje SweetAlert
        swal('Nuevo genero', `${json.mensaje} creado con éxito`, 'success');
      },

      // Si error
      err => {
        this.errors = err.error.errores as string[];
        console.error('Código del error (backend): ' + err.error.status);
        console.error(err.error.errores);
      }
    );
  }

  // Obtener genero por ID
  public cargarGenero(): void {
    this.activatedRoute.params.subscribe(params => {
      let id = params['id'];
      if(id) {
        this.generoService.getGenero(id).subscribe(
          (genero) => this.genero = genero
        );
      }
    });
  }

  // Update genero por ID
  public update(): void {
    this.generoService.updateGenero(this.genero).subscribe(

      // Si OK
      json => {
        this.router.navigate(['/generos'])
        //Mensaje
        swal('Genero Actualizado', `${json.mensaje}`, 'success');
      },

      // Si error
      err => {
        this.errors = err.error.errores as string[];
        console.error('Código del error (backend): ' + err.error.status);
        console.error(err.error.errores);
      }
    );
  }

  // Delete en genero.component.ts

}
