export interface DefaultUnitSeed {
  readonly name: string;
  readonly shortName: string;
}

export const defaultUnits: readonly DefaultUnitSeed[] = [
  { name: "Kilogram", shortName: "kg" },
  { name: "Gram", shortName: "g" },
  { name: "Unit", shortName: "unit" },
  { name: "Bottle", shortName: "bottle" },
  { name: "Hour", shortName: "hr" },
  { name: "Piece", shortName: "pcs" },
  { name: "Roll", shortName: "roll" },
  { name: "Meter", shortName: "m" },
  { name: "Litre", shortName: "l" },
];
