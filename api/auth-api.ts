import api from "@/lib/api";
import { Music } from "@/types/music";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    _id: string;
    name: string;
    email: string;
    image?: string;
    role: "admin" | "user";
  };
}

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  image?: string;
  role: "admin" | "user";
}

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post("/public/auth/login", data);
    return response.data.data;
  },

  signup: async (data: SignupRequest): Promise<AuthResponse> => {
    const response = await api.post("/public/auth/register", data);
    return response.data;
  },

  getProfile: async (): Promise<UserProfile> => {
    const response = await api.get("/public/auth/profile");
    return response.data;
  },

  getMoodMusic: async (
    photo: File
  ): Promise<{
    mood: "happy" | "sad" | "angry" | "not_found";
    musicList: Music[];
  }> => {
    const formData = new FormData();
    formData.append("photo", photo);
    const response = await api.post("/public/musics/mood", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data.data;
  },
};
