import { MappedDataElement } from "@/interfaces/interfaces";

export type ScaleTypes =
  | ((point: MappedDataElement) => Date)
  | ((point: MappedDataElement) => number);
