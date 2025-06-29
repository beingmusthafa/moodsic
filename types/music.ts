export interface Music {
  _id: string;
  title: string;
  audioUrl: string;
  imageUrl: string;
  artists: string[];
  mood: string;
}

export interface MusicByMood {
  [mood: string]: Music[];
}
