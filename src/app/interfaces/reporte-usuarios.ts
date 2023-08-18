export interface UsuariosMesRes {
  encargado:      string;
  porcentaje:  string;
  servicios: string;
  pendientes: string;
  no_autorizado: string;
  por_autorizar: string;
  terminados: string;
  entregados: string;
  importe?: string;
}

// Converts JSON strings to/from your types
export class Convert {
  public static toUsuariosMesRes(json: string): UsuariosMesRes[] {
      return JSON.parse(json);
  }

  public static usuariosMesResToJson(value: UsuariosMesRes[]): string {
      return JSON.stringify(value);
  }
}
