// To parse this data:
//
//   import { Convert } from "./file";
//
//   const expressRes = Convert.toExpressRes(json);

export interface ExpressRes {
    id:          number;
    id_usuario:  number;
    fecha:       Date;
    herramienta: string;
    falla:       string;
    cotizacion:  null | string;
    importe:     number | null;
    encargado:   string;
}

// Converts JSON strings to/from your types
export class Convert {
    public static toExpressRes(json: string): ExpressRes[] {
        return JSON.parse(json);
    }

    public static expressResToJson(value: ExpressRes[]): string {
        return JSON.stringify(value);
    }
}
