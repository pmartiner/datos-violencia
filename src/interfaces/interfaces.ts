// Interfaz para las opciones del Select
export interface Option {
  id: string | number;
  name: string;
}

// Interfaz para la respuesta del servicio web
export interface DataResponse {
  id_month?: number;
  pop_total_mun1: string;
  tasa_ent: string;
  tasa_mun1: string;
  tasa_nac: string;
  total_ent: string;
  total_mun1: string;
  total_nac: string;
  year: number;
}

// Interfaz para el error del servicio web
export interface ErrorResponse {
  code: string | number;
  file: string;
  hint?: string;
  length: number;
  line: string;
  name: string;
  position: string;
  routine: string;
  severity: string;
}

export interface MappedDataElement {
  year: Date;
  tasa_mun: number;
}
