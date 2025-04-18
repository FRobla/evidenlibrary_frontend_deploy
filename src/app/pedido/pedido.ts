import { detallesPedido } from "../detalles-pedido/detalles-pedido";
import { Usuario } from "../usuario/usuario";

export class Pedido {
    id?: number;
    usuario: Usuario | undefined;
    fechaPedido: string = "";
    estado: string = "";
    total: number = 0;
    precioTotal: number = 0;
    direccionEnvio: string = "";
    detalles: detallesPedido[] = [];
}