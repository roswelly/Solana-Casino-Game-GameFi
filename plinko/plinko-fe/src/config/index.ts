const colors = {
  background: '#0a0e1a',
  primary: '#213743',
  secondary: '#3d5564',
  text: '#F2F7FF',
  purple: '#C52BFF',
  purpleDark: '#8D27B3'
}

const pins = {
  startPins: 3,
  pinSize: 3,
  pinGap: 30
}

const ball = {
  ballSize: 7
}

const engine = {
  engineGravity: 1
}

const world = {
  width: 600,
  height: 630
}

const ColorsPerBet = {
  easy: {
    color: '#2280f6',
    tailwind: 'bg-blueGrey'
  },
  medium: {
    color: '#47ef63',
    tailwind: 'bg-greenGrey'
  },
  diff: {
    color: '#fc3166',
    tailwind: 'bg-redGrey'
  }
}

export const config = {
  pins,
  ball,
  engine,
  world,
  colors,
  ColorsPerBet
}

