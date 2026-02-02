import classNames from 'classnames'

import { BetType } from "../../@types"
import { config } from '../../config'

interface multiplierHistoryType {
  type: BetType,
  value: number
}

interface MultiplierHistoryProps {
  multiplierHistory: multiplierHistoryType[]
}

export function MultiplierHistory({
  multiplierHistory
}: MultiplierHistoryProps) {
  const {
    ColorsPerBet
  } = config
  return (
    <div className="absolute right-[100px] sm:right-[40px] top-[60px] flex w-16 flex-col gap-[4px] overflow-hidden rounded-md bg-background x-multiplier">
      {multiplierHistory.map((multiplier, index) => {
        if (!multiplier || index > 3 || !multiplier.value) return null
        return (
          <span
            key={index}
            className={classNames('flex items-center justify-center px-[8px] py-[4px] font-bold text-text', ColorsPerBet[multiplier.type].tailwind)}
          >
            {multiplier.value}x
          </span>
        )
      })}
    </div>
  )
}
