// To parse this data:
//
//   import { Convert } from "./file";
//
//   const marcasRes = Convert.toMarcasRes(json);

export interface MarcasRes {
  id:    number;
  value: string;
}

// Converts JSON strings to/from your types
export class Convert {
  public static toMarcasRes(json: string): MarcasRes[] {
      return JSON.parse(json);
  }

  public static marcasResToJson(value: MarcasRes[]): string {
      return JSON.stringify(value);
  }
}
