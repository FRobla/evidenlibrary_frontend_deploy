import { Libro } from "../libro/libro";
import { Usuario } from "../usuario/usuario";

export class Valoracion {
    id: number = 0;
    usuario: Usuario | undefined;
    libro: Libro | undefined;
    libroDetalles: number = 0;
    puntuacion: number = 0;
    comentario: string = "";
    fecha: Date = new Date();
}