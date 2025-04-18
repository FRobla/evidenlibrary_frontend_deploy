import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { PrincipalComponent } from './principal/principal.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { FooterComponent } from './footer/footer.component';
import { AutorComponent } from './autor/autor.component';
import { LibroComponent } from './libro/libro.component';
import { GenerosComponent } from './generos/generos.component';
import { UsuarioComponent } from './usuario/usuario.component';
import { RouterModule, withViewTransitions } from '@angular/router';
import { FavoritoComponent } from './favorito/favorito.component';
import { CarritoComponent } from './carrito/carrito.component';
import { DetallesCarritoComponent } from './detalles-carrito/detalles-carrito.component';
import { PedidoComponent } from './pedido/pedido.component';
import { DetallesPedidoComponent } from './detalles-pedido/detalles-pedido.component';
import { ValoracionComponent } from './valoracion/valoracion.component';
import { DetallesLibroComponent } from './detalles-libro/detalles-libro.component';
import { SearchComponent } from './search/search.component';
import { FormsModule } from '@angular/forms';
import { ResultadoBusquedaComponent } from './resultado-busqueda/resultado-busqueda.component';
import { PaginatorComponent } from './paginator/paginator.component';
import { AdminComponent } from './admin/admin.component';
import { DetallesFavoritoComponent } from './detalles-favorito/detalles-favorito.component';
import { FormLibroComponent } from './form-libro/form-libro.component';
import { FormAutorComponent } from './form-autor/form-autor.component';
import { FormGeneroComponent } from './form-genero/form-genero.component';
import { FormValoracionComponent } from './form-valoracion/form-valoracion.component';
import { appConfig } from './app.config';
import { RankingComponent } from './ranking/ranking.component';
import { LibroService } from './libro/libro.service';
import { DetallesUsuarioComponent } from './detalles-usuario/detalles-usuario.component';
import { FormUsuarioComponent } from './form-usuario/form-usuario.component';
import { LoginComponent } from './login/login.component';
import { ErrorComponent } from './error/error.component';
import { RegistroComponent } from './registro/registro.component';
import { SeccionCategoriaComponent } from './seccion-categoria/seccion-categoria.component';
import { NgxPayPalModule } from 'ngx-paypal';
import { PaypalComponent } from './paypal/paypal.component';
import { AuthInterceptor } from './login/auth.interceptor';


@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    PrincipalComponent,
    FooterComponent,
    AutorComponent,
    LibroComponent,
    GenerosComponent,
    UsuarioComponent,
    FavoritoComponent,
    CarritoComponent,
    DetallesCarritoComponent,
    PedidoComponent,
    DetallesPedidoComponent,
    ValoracionComponent,
    DetallesLibroComponent,
    SearchComponent,
    ResultadoBusquedaComponent,
    PaginatorComponent,
    RankingComponent,
    AdminComponent,
    DetallesFavoritoComponent,
    FormLibroComponent,
    FormAutorComponent,
    FormGeneroComponent,
    FormValoracionComponent,
    DetallesUsuarioComponent,
    LoginComponent,
    ErrorComponent,
    RegistroComponent,
    SeccionCategoriaComponent,
    FormUsuarioComponent,
    PaypalComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    RouterModule,
    FormsModule,
    NgxPayPalModule
],
  providers: [
    ...appConfig.providers, 
    LibroService,
    {provide:HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
