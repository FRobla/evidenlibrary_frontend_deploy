import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LibroComponent } from './libro/libro.component';
import { AutorComponent } from './autor/autor.component';
import { UsuarioComponent } from './usuario/usuario.component';
import { GenerosComponent } from './generos/generos.component';
import { PrincipalComponent } from './principal/principal.component';
import { CarritoComponent } from './carrito/carrito.component';
import { DetallesCarritoComponent } from './detalles-carrito/detalles-carrito.component';
import { DetallesPedidoComponent } from './detalles-pedido/detalles-pedido.component';
import { FavoritoComponent } from './favorito/favorito.component';
import { PedidoComponent } from './pedido/pedido.component';
import { ValoracionComponent } from './valoracion/valoracion.component';
import { DetallesLibroComponent } from './detalles-libro/detalles-libro.component';
import { AdminComponent } from './admin/admin.component';
import { FormLibroComponent } from './form-libro/form-libro.component';
import { FormAutorComponent } from './form-autor/form-autor.component';
import { FormGeneroComponent } from './form-genero/form-genero.component';
import { FormValoracionComponent } from './form-valoracion/form-valoracion.component';
import { ResultadoBusquedaComponent } from './resultado-busqueda/resultado-busqueda.component';
import { DetallesUsuarioComponent } from './detalles-usuario/detalles-usuario.component';
import { FormUsuarioComponent } from './form-usuario/form-usuario.component';
import { AuthGuard } from './login/auth.guard';
import { LoginComponent } from './login/login.component';
import { RegistroComponent } from './registro/registro.component';
import { ErrorComponent } from './error/error.component';
import { DetallesFavoritoComponent } from './detalles-favorito/detalles-favorito.component';

export const routes: Routes = [

  // Rutas protegidas para ADMIN
  { 
    path: 'admin', 
    component: AdminComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN'] } 
  },
  { 
    path: 'libro/form', 
    component: FormLibroComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN'] } 
  },
  { 
    path: 'libro/form/:id', 
    component: FormLibroComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN'] } 
  },
  { 
    path: 'favoritos', 
    component: FavoritoComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN'] } 
  },
  { 
    path: 'autor/form', 
    component: FormAutorComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN'] } 
  },
  { 
    path: 'autor/form/:id', 
    component: FormAutorComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN'] } 
  },
  { 
    path: 'genero/form', 
    component: FormGeneroComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN'] } 
  },
  { 
    path: 'genero/form/:id', 
    component: FormGeneroComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN'] } 
  },
  { 
    path: 'valoracion/form', 
    component: FormValoracionComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN'] } 
  },
  { 
    path: 'valoracion/form/:id', 
    component: FormValoracionComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN'] } 
  },
  { path: 'usuarios', 
    component: UsuarioComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN'] } 
  },
  { path: 'pedidos', 
    component: PedidoComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN'] } 
  },
  { 
    path: 'carritos', 
    component: CarritoComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN'] } 
  },

  // Rutas protegidas para USUARIO
  { 
    path: 'usuario', 
    component: DetallesUsuarioComponent,
    canActivate: [AuthGuard],
    data: { roles: ['USER', 'ADMIN'] } 
  },
  { 
    path: 'usuario/:id', 
    component: DetallesUsuarioComponent,
    canActivate: [AuthGuard],
    data: { roles: ['USER', 'ADMIN'] } 
  },
  { 
    path: 'detalles-usuario/:id', 
    component: DetallesUsuarioComponent,
    canActivate: [AuthGuard],
    data: { roles: ['USER', 'ADMIN'] } 
  },
  { 
    path: 'usuario/form/:id', 
    component: FormUsuarioComponent,
    canActivate: [AuthGuard],
    data: { roles: ['USER', 'ADMIN'] } 
  },
  { 
    path: 'mis-favoritos', 
    component: DetallesFavoritoComponent,
    canActivate: [AuthGuard],
    data: { roles: ['USER'] } 
  },
  { 
    path: 'mi-carrito', 
    component: DetallesCarritoComponent,
    canActivate: [AuthGuard],
    data: { roles: ['USER'] } 
  },

  // Rutas públicas (todos)
  { path: '', redirectTo: '/principal', pathMatch: 'full' },
  { path: 'principal', component: PrincipalComponent },
  { path: 'libros', component: LibroComponent },
  { path: 'libros/page/:page', component: LibroComponent},
  { path: 'libros/autor/:autorId/page/:page/size/:size', component: LibroComponent},
  { path: 'libros/genero/:generoId/page/:page/size/:size', component: LibroComponent},
  { path: 'libros/autor/:autorId/genero/:generoId/page/:page/size/:size', component: LibroComponent},
  { path: 'libro/:id', component: DetallesLibroComponent },
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },
  { path: 'valoraciones', component: ValoracionComponent},
  { path: 'valoraciones/page/:page', component: ValoracionComponent},
  { path: 'valoraciones/page/:page/size/:size', component: ValoracionComponent},
  { path: 'generos', component: GenerosComponent},
  { path: 'autores', component: AutorComponent},
  { path: 'autores/page/:page', component: AutorComponent},
  { path: 'autores/page/:page/size/:size', component: AutorComponent},
  { path: 'search-results', component: ResultadoBusquedaComponent},
  { path: 'error', component: ErrorComponent },

  // Ruta de error
  { path: '**', redirectTo: '/error' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      scrollPositionRestoration: "enabled",
      anchorScrolling: "enabled",
      onSameUrlNavigation: "reload",
      enableTracing: false,
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule { }
