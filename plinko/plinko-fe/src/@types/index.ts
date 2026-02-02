export type LinesType = 16

export type MultiplierValuesType =
  | 0.2
  | 0.3
  | 1
  | 1.1
  | 1.2
  | 1.3
  | 1.5
  | 2
  | 2.8
  | 4
  | 5
  | 9
  | 10
  | 23
  | 41
  | 110
  | 130
  | 1000

export enum MultiplierColors {
  RED_DARKER = '#ff003f',
  RED_DARK = '#ff1837',
  RED = '#ff302f',
  ORANGE_DARK = '#ff4827',
  ORANGE = '#ff6020',
  ORANGE_LIGHT = '#ff7818',
  YELLOW_DARK = '#ff9010',
  YELLOW = '#ffa818',
  YELLOW_LIGHT = '#ffc000'
}

export type BetType = 'easy' | 'medium' | 'diff'

export type MultiplierValues =
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16

type MultiplierLabelType = `block-${MultiplierValues}`

export type MultiplierType = {
  label: MultiplierLabelType
  img: string
}

export interface HistoryType {
  username: string,
  odds: number,
  betAmount: number
}
