export interface ServiciosMesRes {
  mes:          string;
  ano:          string;
  porAutorizar?: string;
  noAutorizado?: string;
  pendiente?:    string;
  entregado?:    string;
  terminado?:    string;
  total?:        string;
  porcPA?:       string;
  porcNA?:       string;
  porcP?:        string;
  porcE?:        string;
  porcT?:        string;
  importeNA?:    string;
  importeTotal?: string;
  importeExpress?: string;
}

// Converts JSON strings to/from your types
export class Convert {
  public static toServiciosMesRes(json: string): ServiciosMesRes {
      return JSON.parse(json);
  }

  public static serviciosMesResToJson(value: ServiciosMesRes): string {
      return JSON.stringify(value);
  }
}
