import { Libro } from "../libro/libro";
import { Usuario } from "../usuario/usuario";

export class FavoritosAgrupados {
    usuario: Usuario | undefined = undefined; 
    libros: {
        libro: Libro | undefined; 
        fechaAgregado: Date | undefined; 
    }[] = [];
  }