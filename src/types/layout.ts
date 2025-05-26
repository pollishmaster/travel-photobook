export interface Photo {
  id: string;
  url: string;
  caption?: string;
  takenAt?: Date;
}

export interface Content {
  id: string;
  type: "single" | "double" | "triple" | "summary";
  photos?: Photo[];
  content?: string;
  date?: Date;
}

export interface Section {
  id: string;
  title: string;
  content: Content[];
}
