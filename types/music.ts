export interface Music {
  id: string
  title: string
  audioUrl: string
  imageUrl: string
  artists: string[]
}

export interface MusicByMood {
  [mood: string]: Music[]
}
