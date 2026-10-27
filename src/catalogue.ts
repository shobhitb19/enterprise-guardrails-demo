export interface Product {
  id: string;
  name: string;
  category: "timber" | "insulation" | "masonry";
  priceCents: number;
  currency: "USD";
}

export const products: readonly Readonly<Product>[] = Object.freeze([
  Object.freeze({ id: "MAT-001", name: "Demo framing timber", category: "timber", priceCents: 1250, currency: "USD" }),
  Object.freeze({ id: "MAT-002", name: "Demo plywood sheet", category: "timber", priceCents: 4200, currency: "USD" }),
  Object.freeze({ id: "MAT-003", name: "Demo insulation roll", category: "insulation", priceCents: 6800, currency: "USD" }),
  Object.freeze({ id: "MAT-004", name: "Demo concrete block", category: "masonry", priceCents: 375, currency: "USD" })
]);
