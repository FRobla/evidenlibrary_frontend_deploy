import { detallesCarrito } from "../detalles-carrito/detalles-carrito";
import { Usuario } from "../usuario/usuario";

export class Carrito {
    id?: number;
    usuario: Usuario | undefined;
    fechaCreacion: Date = new Date();
    estado: string = "";
    detalles: detallesCarrito[] = [];
}