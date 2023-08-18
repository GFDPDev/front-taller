
export interface GraficasRes {
  marcas:   Datos[];
  tecnicos: Datos[];
  estados:  Datos[];
}


export interface Datos {
  id?:       string;
  cantidad: string;
  valor:    string;
}

// Converts JSON strings to/from your types
export class Convert {
  public static toGraficasRes(json: string): GraficasRes {
      return JSON.parse(json);
  }

  public static graficasResToJson(value: GraficasRes): string {
      return JSON.stringify(value);
  }
}
