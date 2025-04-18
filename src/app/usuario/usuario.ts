import { Pedido } from "../pedido/pedido";
import { Valoracion } from "../valoracion/valoracion";

export class Usuario {
    id: number = 0;
    apellido: string = "";
    direccion: string = "";
    email: string = "";
    nombre: string = "";
    password?: string = "";
    rol: string = "";
    foto: string = "";
    pedidos: Pedido[] = [];
    valoraciones: Valoracion[] = [];
}