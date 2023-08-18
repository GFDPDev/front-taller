
export interface LoginRes {
  id:       string;
  nombre?:   string;
  apellido?: string;
  tipo?:     string;
  curp?:     string;
  error?:   boolean;
  message?: string;
}

// Converts JSON strings to/from your types
export class Convert {
  public static toLoginRes(json: string): LoginRes {
      return JSON.parse(json);
  }

  public static loginResToJson(value: LoginRes): string {
      return JSON.stringify(value);
  }
}
