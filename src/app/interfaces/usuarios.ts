// To parse this data:
//
//   import { Convert } from "./file";
//
//   const UsuariosRes = Convert.toUsuariosRes(json);

export interface UsuariosRes {
  id:       string;
  nombre:   string;
  apellido: string;
  tipo:     string;
  curp:     string;
  password: string;
  activo:   string;
  error?:   boolean;
  message?: string;
}

// Converts JSON strings to/from your types
export class Convert {
  public static toUsuariosRes(json: string): UsuariosRes[] {
      return JSON.parse(json);
  }

  public static UsuariosResToJson(value: UsuariosRes[]): string {
      return JSON.stringify(value);
  }
}
