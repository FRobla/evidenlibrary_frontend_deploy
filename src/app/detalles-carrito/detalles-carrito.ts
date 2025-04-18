import { Libro } from "../libro/libro";
import { Carrito } from "../carrito/carrito";

export class detallesCarrito {
    id?: number;
    carrito?: Carrito;
    libro: Libro = new Libro();
    cantidad: number = 0;
    precioUnitario: number = 0;
}