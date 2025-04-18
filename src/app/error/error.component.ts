import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-error',
  standalone: false,
  templateUrl: './error.component.html',
  styleUrl: './error.component.css'
})
export class ErrorComponent implements OnInit{
  errorCode: string = '';
  errorMessage: string = '';

  constructor(private route: ActivatedRoute) {}
  ngOnInit():void{
    //Obtener parámetros de la ruta si existen
    this.route.queryParams.subscribe(params => {
      if(params['code']){
        this.errorCode = params ['code'];
      }
      if(params['message']) {
        this.errorMessage = params['message'];
      }
    });
  }

}
