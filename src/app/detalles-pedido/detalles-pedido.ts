import { Libro } from "../libro/libro";
import { Pedido } from "../pedido/pedido";

export class detallesPedido {
    id?: number;
    pedido: Pedido = new Pedido();
    libro: Libro = new Libro();
    cantidad: number = 0;
    precioUnitario: number = 0;
}