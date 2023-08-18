
export interface ClientesRes {
  id:       string;
  nombre:   string;
  apellido: string;
  telefono: string;
  curp:     string;
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

