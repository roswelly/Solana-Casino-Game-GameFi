import { CircleNotch } from 'phosphor-react'

interface PropsType {
  size?: number | null
}

export function Loading({ size }: PropsType) {
  return (
    <div className="flex h-full w-full items-center justify-center text-purple">
      <CircleNotch className="animate-spin" size={size || 50} weight="bold" />
    </div>
  )
}
