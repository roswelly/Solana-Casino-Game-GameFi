export function random(min: number, max: number) {
  const random = Math.random()
  min = Math.round(min)
  max = Math.floor(max)

  return random * (max - min) + min
}
