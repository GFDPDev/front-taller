// To parse this data:
//
//   import { Convert } from "./file";
//
//   const expressMesRess = Convert.toExpressMesRess(json);

export interface ExpressMesRess {
  id_encargado?: string;
  encargado?:    string;
  servicios?:    string;
  importe?:      string;
}

// Converts JSON strings to/from your types
export class Convert {
  public static toExpressMesRess(json: string): ExpressMesRess[] {
      return JSON.parse(json);
  }

  public static expressMesRessToJson(value: ExpressMesRess[]): string {
      return JSON.stringify(value);
  }
}
