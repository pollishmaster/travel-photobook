export type TripNoteType = "quote" | "summary";

export interface TripNoteInput {
  content: string;
  type: TripNoteType;
}

export interface TripNote extends TripNoteInput {
  id: string;
  date: string;
}
