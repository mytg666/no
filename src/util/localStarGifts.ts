import type { ApiStarGiftRegular, ApiSticker } from '../api/types';

import { LOCAL_TGS_URLS } from '../components/common/helpers/animatedAssets';

export type LocalGiftLevel = {
  level: number;
  title: string;
  tgsUrl: string;
  upgradeCost?: number;
};

export type LocalGiftDefinition = {
  /**
   * Stable identifier that is also used as the base gift id in the shop.
   */
  id: string;
  /**
   * Base purchase price (in stars).
   */
  price: number;
  /**
   * Optional total supply. When defined, availability will decrease locally on purchase.
   */
  supply?: number;
  /**
   * Display levels, starting from 1.
   */
  levels: LocalGiftLevel[];
};

export type LocalGiftMetadata = {
  localGiftId: string;
  localLevel: number;
  localLevels: LocalGiftLevel[];
  localMaxLevel: number;
};

const AVAILABILITY_STORAGE_KEY_PREFIX = 'localGiftAvailability:';

export const LOCAL_STAR_GIFT_DEFINITIONS: LocalGiftDefinition[] = [
  {
    id: 'gift-sweets',
    price: 5,
    levels: [
      { level: 1, title: '🍭 Конфета', tgsUrl: LOCAL_TGS_URLS.WhipCupcake, upgradeCost: 10 },
      { level: 2, title: '🍬 Леденец', tgsUrl: LOCAL_TGS_URLS.IceCream, upgradeCost: 25 },
      { level: 3, title: '🍰 Пирожное', tgsUrl: LOCAL_TGS_URLS.MousseCake, upgradeCost: 50 },
      { level: 4, title: '🎂 Торт', tgsUrl: LOCAL_TGS_URLS.Cake },
    ],
  },
  {
    id: 'gift-flowers',
    price: 25,
    supply: 1000,
    levels: [
      { level: 1, title: '🌹 Роза', tgsUrl: LOCAL_TGS_URLS.Rose, upgradeCost: 35 },
      { level: 2, title: '💐 Букет', tgsUrl: LOCAL_TGS_URLS.Buket, upgradeCost: 60 },
      { level: 3, title: '🌺 Весенняя корзина', tgsUrl: LOCAL_TGS_URLS.SpringBasket, upgradeCost: 120 },
      { level: 4, title: '🏆 Трофей', tgsUrl: LOCAL_TGS_URLS.Champion },
    ],
  },
  {
    id: 'gift-tech',
    price: 40,
    levels: [
      { level: 1, title: '🔧 Гаджет', tgsUrl: LOCAL_TGS_URLS.InputKey, upgradeCost: 80 },
      { level: 2, title: '⚔️ Световой клинок', tgsUrl: LOCAL_TGS_URLS.LightSword, upgradeCost: 160 },
      { level: 3, title: '🛡️ Геройский шлем', tgsUrl: LOCAL_TGS_URLS.HeroicHelmet, upgradeCost: 250 },
      { level: 4, title: '💪 Кибер-броня', tgsUrl: LOCAL_TGS_URLS.MightyArm },
    ],
  },
  {
    id: 'gift-space',
    price: 60,
    supply: 500,
    levels: [
      { level: 1, title: '🚀 Ракета', tgsUrl: LOCAL_TGS_URLS.Rocket, upgradeCost: 150 },
      { level: 2, title: '🛰️ Звёздный шаттл', tgsUrl: LOCAL_TGS_URLS.StellarRocket, upgradeCost: 300 },
      { level: 3, title: '🌙 Лунный талисман', tgsUrl: LOCAL_TGS_URLS.MoonPendant, upgradeCost: 450 },
      { level: 4, title: '💎 Артефакт', tgsUrl: LOCAL_TGS_URLS.ArtisanBrick },
    ],
  },
];

export function isLocalGiftId(giftId: string): boolean {
  return LOCAL_STAR_GIFT_DEFINITIONS.some((definition) => definition.id === giftId);
}

export function getLocalGiftDefinition(giftId: string): LocalGiftDefinition | undefined {
  return LOCAL_STAR_GIFT_DEFINITIONS.find((definition) => definition.id === giftId);
}

export function getLocalGiftAvailability(definition: LocalGiftDefinition): number | undefined {
  if (!definition.supply) {
    return undefined;
  }

  try {
    const storageKey = `${AVAILABILITY_STORAGE_KEY_PREFIX}${definition.id}`;
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      return Number.parseInt(stored, 10);
    }

    localStorage.setItem(storageKey, definition.supply.toString());
    return definition.supply;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('Failed to access localStorage for gift availability', error);
    return definition.supply;
  }
}

export function decreaseLocalGiftAvailability(definition: LocalGiftDefinition): number | undefined {
  if (!definition.supply) {
    return undefined;
  }

  try {
    const storageKey = `${AVAILABILITY_STORAGE_KEY_PREFIX}${definition.id}`;
    const stored = localStorage.getItem(storageKey);
    const current = stored ? Number.parseInt(stored, 10) : definition.supply;
    const next = Math.max(0, current - 1);
    localStorage.setItem(storageKey, next.toString());
    return next;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('Failed to update gift availability in localStorage', error);
    return Math.max(0, definition.supply - 1);
  }
}

export function getLocalGiftLevel(definition: LocalGiftDefinition, level: number): LocalGiftLevel {
  const foundLevel = definition.levels.find((item) => item.level === level);
  if (!foundLevel) {
    throw new Error(`Unknown local gift level ${level} for ${definition.id}`);
  }
  return foundLevel;
}

export function getNextLocalGiftLevel(definition: LocalGiftDefinition, level: number): LocalGiftLevel | undefined {
  return definition.levels.find((item) => item.level === level + 1);
}

export function calculateInvestedStars(definition: LocalGiftDefinition, level: number): number {
  const base = definition.price;
  if (level <= 1) {
    return base;
  }

  const upgradeCosts = definition.levels
    .filter((item) => item.level > 1 && item.level <= level)
    .map((item) => item.upgradeCost || 0)
    .reduce((accumulator, cost) => accumulator + cost, 0);

  return base + upgradeCosts;
}

function buildSticker(definition: LocalGiftDefinition, level: LocalGiftLevel): ApiSticker {
  return {
    mediaType: 'sticker',
    id: `${definition.id}-lvl-${level.level}`,
    stickerSetInfo: { shortName: `${definition.id}-collection` },
    isLottie: true,
    isVideo: false,
    tgsUrl: level.tgsUrl,
  } as ApiSticker;
}

export function buildLocalStarGift(
  definition: LocalGiftDefinition,
  level: LocalGiftLevel,
  availability?: number,
): ApiStarGiftRegular & LocalGiftMetadata {
  const investedStars = calculateInvestedStars(definition, level.level);
  const gift: ApiStarGiftRegular & LocalGiftMetadata = {
    type: 'starGift',
    id: definition.id,
    sticker: buildSticker(definition, level),
    stars: investedStars,
    starsToConvert: Math.floor(investedStars * 0.8),
    title: level.title,
    ...(definition.supply && {
      isLimited: true,
      availabilityTotal: definition.supply,
      availabilityRemains: availability,
      isSoldOut: availability === 0,
    }),
    upgradeStars: getNextLocalGiftLevel(definition, level.level)?.upgradeCost,
    localGiftId: definition.id,
    localLevel: level.level,
    localLevels: definition.levels,
    localMaxLevel: definition.levels.length,
  } as ApiStarGiftRegular & LocalGiftMetadata;

  // Preserve direct tgsUrl for easier access in components.
  (gift as ApiStarGiftRegular & LocalGiftMetadata & { tgsUrl: string }).tgsUrl = level.tgsUrl;

  return gift;
}

export function cloneLocalGiftForLevel(
  existingGift: ApiStarGiftRegular & LocalGiftMetadata,
  level: LocalGiftLevel,
): ApiStarGiftRegular & LocalGiftMetadata {
  const definition = getLocalGiftDefinition(existingGift.localGiftId);
  if (!definition) {
    throw new Error(`Unknown local gift definition for ${existingGift.localGiftId}`);
  }

  const availability = definition.supply ? existingGift.availabilityRemains : undefined;
  return buildLocalStarGift(definition, level, availability);
}

