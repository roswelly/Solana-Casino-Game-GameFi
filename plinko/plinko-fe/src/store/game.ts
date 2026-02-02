import create from 'zustand'

interface Game {
  gamesRunning: number
  incrementGamesRunning: () => void
  decrementGamesRunning: () => void
}

export const useGameStore = create<Game>((set, get) => ({
  gamesRunning: 0,
  incrementGamesRunning: () => {
    const gamesRunning = get().gamesRunning
    const calc = gamesRunning + 1

    set({ gamesRunning: calc < 0 ? 1 : calc })
  },
  decrementGamesRunning: () => {
    const gamesRunning = get().gamesRunning
    const calc = gamesRunning - 1

    set({ gamesRunning: calc < 0 ? 0 : calc })
  }
}))
