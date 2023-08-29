// To parse this data:
//
//   import { Convert } from "./file";
//
//   const externosRes = Convert.toExternosRes(json);

export interface ExternosRes {
  id:             number;
  id_usuario:     number;
  folio:          string;
  fecha_registro: Date;
  garantia:       number;
  marca:          string;
  id_cliente:     number;
  cotizacion:     string;
  importe:        number;
  cita:           Date;
  estado:         string;
  observaciones:  string;
  avisado:        number;
  nombre_cliente: string;
  encargado:      string;
}


// Converts JSON strings to/from your types
export class Convert {
  public static toExternosRes(json: string): ExternosRes[] {
      return JSON.parse(json);
  }

  public static externosResToJson(value: ExternosRes[]): string {
      return JSON.stringify(value);
  }
}