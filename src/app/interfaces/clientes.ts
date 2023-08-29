// To parse this data:
//
//   import { Convert } from "./file";
//
//   const clientesRes = Convert.toClientesRes(json);

export interface ClientesRes {
  id:       number;
  nombre:   string;
  apellido: string;
  telefono: string;
  curp:     string;
  activo:   number;
}

// Converts JSON strings to/from your types
export class Convert {
  public static toClientesRes(json: string): ClientesRes[] {
      return JSON.parse(json);
  }

  public static clientesResToJson(value: ClientesRes[]): string {
      return JSON.stringify(value);
  }
}
