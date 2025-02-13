export interface SimpleCardType {
  id: string;
  name: string;
  owner: string;
  attachedCard: Card[];
  imageL: string;
  imageS: string;
  subtype: string[];
  type: string[];
  supertype: string;
}

export type VisibilityType = "ALL" | "NONE" | "PLAYER_ONE" | "PLAYER_TWO";

export type AreaName =
  | "playerOneHand"
  | "playerOneDeck"
  | "playerOneTrash"
  | "playerOneLostZone"
  | "playerOneArena"
  | "playerOnePlayground"
  | "playerOnePrize"
  | "playerTwoHand"
  | "playerTwoDeck"
  | "playerTwoTrash"
  | "playerTwoLostZone"
  | "playerTwoArena"
  | "playerTwoPlayground"
  | "playerTwoPrize"
  | "stadium";
