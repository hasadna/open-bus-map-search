/**
 * Geometry shared by the axis and the labels hanging off it. It lives apart from both
 * components because they would otherwise have to import each other.
 */

/** Breathing room above the first timestamp and below the last. */
export const PADDING = 10

/** One line of time text, and the smallest gap that keeps two labels legibly apart. */
export const LABEL_HEIGHT = 18
export const LABEL_GAP = 3

export const CARD_TIME_HEIGHT = 18
export const CARD_TIME_FONT_SIZE = '0.875rem'
export const CARD_ROW_HEIGHT = 16
export const CARD_ROW_FONT_SIZE = '0.75rem'

export const CARD_PADDING_Y = 4
export const CARD_PADDING_X = 6
const CARD_BORDER = 1

/** How tall a card carrying `rows` label rows lays out. Collision resolution works off this
 *  number, so it has to match what the card's CSS actually produces. */
export const cardHeight = (rows: number) =>
  CARD_TIME_HEIGHT + rows * CARD_ROW_HEIGHT + CARD_PADDING_Y * 2 + CARD_BORDER * 2
