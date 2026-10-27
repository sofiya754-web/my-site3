export interface Fragrance {
  id: string;
  name: string;
  subtitle: string;
  desc: string;
  src: string;
  price: number;
  volume: string;
  family: string;
  perfumer: string;
  topNotes: string[];
  heartNotes: string[];
  baseNotes: string[];
  story: string;
  inspiration: string;
  colorAccent: string;
}

export interface CartItem {
  fragrance: Fragrance;
  quantity: number;
  engraving?: string;
}
