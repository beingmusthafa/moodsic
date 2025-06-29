import type { Music } from "@/types/music";
import api from "@/lib/api";
export interface CreateMusicRequest {
  title: string;
  artists: string[];
  mood: string;
  musicFile: File;
  thumbnail: File;
}

export interface UpdateMusicRequest {
  title: string;
  artists: string[];
  mood: string;
  musicFile?: File;
  thumbnail?: File;
}

export const adminApi = {
  getAllMusic: async (): Promise<Music[]> => {
    const response = await api.get("/admin/musics");
    return response.data.data;
  },

  createMusic: async (data: CreateMusicRequest): Promise<Music> => {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("artists", JSON.stringify(data.artists));
    formData.append("mood", data.mood);
    formData.append("audio", data.musicFile);
    formData.append("image", data.thumbnail);

    const response = await api.post("/admin/musics", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data.data;
  },

  updateMusic: async (
    musicId: string,
    data: UpdateMusicRequest
  ): Promise<Music> => {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("artists", JSON.stringify(data.artists));
    formData.append("mood", data.mood);

    if (data.musicFile) {
      formData.append("audio", data.musicFile);
    }
    if (data.thumbnail) {
      formData.append("image", data.thumbnail);
    }

    const response = await api.put(`/admin/musics/${musicId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data.data;
  },

  deleteMusic: async (musicId: string): Promise<void> => {
    await api.delete(`/admin/music/${musicId}`);
  },
};
