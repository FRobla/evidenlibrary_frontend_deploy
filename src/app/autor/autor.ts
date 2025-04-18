import { Libro } from "../libro/libro";

export class Autor {
    id = 0;
    nombre: string= "" ;
    biografia: string= "";
    libros: Libro[] = [];
}