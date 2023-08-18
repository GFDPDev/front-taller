// To parse this data:
//
//   import { Convert } from "./file";
//
//   const externosRes = Convert.toExternosRes(json);

export interface ExternosRes {
  id:             string;
  folio:          string;
  garantia:       string;
  fecha_registro: Date;
  marca:          string;
  id_usuario:     string;
  id_cliente:     string;
  nombre_cliente: string;
  encargado:      string;
  cotizacion:     string;
  importe:        string;
  cita:           Date;
  estado:         string;
  observaciones:  string;
  avisado:        string;

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
