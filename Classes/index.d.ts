export interface Card {
  id: string;
  name: string;
  image: string;
  owner: string;
  attachedCard: Card[]
}

export type VisibilityType = "ALL" | "NONE" | "PLAYER_1" | "PLAYER_2"