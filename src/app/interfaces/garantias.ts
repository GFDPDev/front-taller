// To parse this data:
//
//   import { Convert } from "./file";
//
//   const garantiasRes = Convert.toGarantiasRes(json);

export interface GarantiasRes {
  id:                       number;
  comprobante:              string;
  autorizo:                 string;
  folio:                    string;
  fecha_registro:           Date;
  producto:                 string;
  marca:                    string;
  modelo:                   string;
  cantidad:                 number;
  costo_unitario:           number;
  total:                    number;
  motivo:                   string;
  fecha_proveedor?:         Date;
  fecha_resuelto_proveedor?:Date;
  fecha_resuelto_cliente?:  Date;
  estado_cliente:           string;
  estado_proveedor:         string;
  id_modificado:            number;
  modificador:              string;
}


// Converts JSON strings to/from your types
export class Convert {
  public static toGarantiasRes(json: string): GarantiasRes[] {
      return JSON.parse(json);
  }

  public static garantiasResToJson(value: GarantiasRes[]): string {
      return JSON.stringify(value);
  }
}
