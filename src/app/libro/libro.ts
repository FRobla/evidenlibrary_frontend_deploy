import { Autor } from "../autor/autor";
import { Genero } from "../generos/generos";
import { Valoracion } from "../valoracion/valoracion";

export class Libro {
    id: number = 0;
    precio: number = 0;
    stock: number = 0;
    titulo: string = "";
    imagen: string = "";
    descripcion: String = "";
    anio: String = "";
    valoraciones: Valoracion[] = [];
    valoracionMedia: number = 0;
    autores: Autor[] = [];
    generos: Genero[] = [];
}