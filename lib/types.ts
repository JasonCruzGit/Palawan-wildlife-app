export type Category = "Mammals" | "Birds" | "Reptiles" | "Plants";
export type Status = "Critically Endangered" | "Endangered" | "Vulnerable" | "Near Threatened" | "Least Concern";

export type Size = "tiny" | "small" | "medium" | "large";
export type Color =
  | "brown"
  | "black"
  | "gray"
  | "green"
  | "blue"
  | "yellow"
  | "white"
  | "multicolor";
export type Habitat =
  | "forest"
  | "mangrove"
  | "coastal"
  | "grassland";

export interface Species {
  id: string;
  slug: string;
  name: string;
  localName: string;
  scientificName: string;
  category: Category;
  status: Status;
  image: string;
  description: string;
  habitat: string;
  diet: string;
  threats: string[];
  facts: string[];
  size: Size;
  colors: Color[];
  habitats: Habitat[];
}

export interface Sighting {
  id: string;
  speciesSlug: string;
  speciesName: string;
  location: string;
  lat: number;
  lng: number;
  date: string;
  notes: string;
}

export type ReportKind = "animal" | "plant";
export type ReportStatus = "pending" | "verified" | "rejected";

export interface PartnerReport {
  id: string;
  kind: ReportKind;
  speciesName: string;
  speciesSlug: string | null;
  scientificName: string;
  location: string;
  lat: number | null;
  lng: number | null;
  date: string;
  notes: string;
  image: string | null;
  status: ReportStatus;
  submittedBy: string;
  submittedByEmail: string;
  createdAt: string;
  reviewedAt: string | null;
  reviewNote: string | null;
  pointsAwarded?: number;
}

export interface PointsLedgerEntry {
  id: string;
  email: string;
  partnerName: string;
  reportId: string;
  speciesName: string;
  points: number;
  year: number;
  createdAt: string;
  reason: string;
}

export interface PartnerPointsSummary {
  email: string;
  year: number;
  total: number;
  entries: PointsLedgerEntry[];
}

export interface CommunityMessage {
  id: string;
  from: string;
  fromRole: string;
  subject: string;
  preview: string;
  body: string;
  createdAt: string;
}
