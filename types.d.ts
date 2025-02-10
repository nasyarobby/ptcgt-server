export interface SetType {
  id: string;
  name: string;
  series: string;
  printedTotal: number;
  total: number;
  legalities: {
    unlimited: string;
    standard: string;
    expanded: string;
  };
  ptcgoCode: string;
  releaseDate: string;
  updatedAt: string;
  images: {
    symbol: string;
    logo: string;
  };
}

export interface SetListResponse {
  data: SetType[];
  page: number;
  pageSize: number;
  count: number;
  totalCount: number;
}

export interface CardType {
  id: string;
  name: string;
  supertype: string;
  subtypes: string[];
  level: string;
  hp: string;
  types: string[];
  evolvesFrom: string;
  evolvesTo: string[];
  rules: string[];
  ancientTrait: {
    name: string;
    text: string;
  };
  abilities: {
    name: string;
    text: string;
    type: string;
  }[];
  attacks: {
    cost: string[];
    name: string;
    text: string;
    damage: string;
    convertedEnergyCost: number;
  }[];
  weaknesses: {
    type: string;
    value: string;
  }[];
  resistances: {
    type: string;
    value: string;
  }[];
  retreatCost: string[];
  convertedRetreatCost: number;
  set: {
    id: string;
    name: string;
    series: string;
    printedTotal: number;
    total: number;
    legalities: {
      unlimited: string;
      standard: string;
      expanded: string;
    };
    ptcgoCode: string;
    releaseDate: string;
    updatedAt: string;
    images: {
      symbol: string;
      logo: string;
    };
  };
  number: string;
  artist: string;
  rarity: string;
  flavorText: string;
  nationalPokedexNumbers: number[];
  legalities: {
    standard: string;
    expanded: string;
    unlimited: string;
  };
  images: {
    small: string;
    large: string;
  };
  tcgplayer: {
    url: string;
    updatedAt: string;
    prices: {
      normal: {
        low: number;
        mid: number;
        high: number;
        market: number;
        directLow: number;
      };
      holofoil: {
        low: number;
        mid: number;
        high: number;
        market: number;
        directLow: number;
      };
      reverseHolofoil: {
        low: number;
        mid: number;
        high: number;
        market: number;
        directLow: number;
      };
      firstEditionHolofoil: {
        low: number;
        mid: number;
        high: number;
        market: number;
        directLow: number;
      };
      firstEditionNormal: {
        low: number;
        mid: number;
        high: number;
        market: number;
        directLow: number;
      };
    };
  };
  cardmarket: {
    url: string;
    updatedAt: string;
    prices: {
      averageSellPrice: number;
      lowPrice: number;
      trendPrice: number;
      germanProLow: number;
      suggestedPrice: number;
      reverseHoloSell: number;
      reverseHoloLow: number;
      reverseHoloTrend: number;
      lowPriceExPlus: number;
      avg1: number;
      avg7: number;
      avg30: number;
      reverseHoloAvg1: number;
      reverseHoloAvg7: number;
      reverseHoloAvg30: number;
    };
  };
}

export interface CardListResponse {
  data: CardType[];
  page: number;
  pageSize: number;
  count: number;
  totalCount: number;
}
