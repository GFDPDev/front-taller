// To parse this data:
//
//   import { Convert } from "./file";
//
//   const garantiaRes = Convert.toGarantiaRes(json);

export interface GarantiaRes {
  id: string;
  comprobante: string;
  autorizo: string;
  folio: string;
  fecha_registro: Date;
  producto: string;
  marca: string;
  modelo: string;
  cantidad: string;
  costo_unitario: string;
  total: string;
  motivo: string;
  fecha_proveedor: Date | undefined;
  fecha_resuelto_proveedor: Date | undefined;
  fecha_resuelto_cliente: Date | undefined;
  estado_cliente: string;
  estado_proveedor: string;
  id_modificado: string;
  modificador: string;
}

// Converts JSON strings to/from your types
export class Convert {
  public static toGarantiaRes(json: string): GarantiaRes[] {
    return JSON.parse(json);
  }

  public static garantiaResToJson(value: GarantiaRes[]): string {
    return JSON.stringify(value);
  }
}
