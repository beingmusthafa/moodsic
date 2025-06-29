"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, X, Music, ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Music as MusicType } from "@/types/music";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const MOODS = ["happy", "sad", "angry"] as const;

const musicFormSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be less than 100 characters"),
  artists: z
    .array(z.string().min(1, "Artist name is required"))
    .min(1, "At least one artist is required"),
  mood: z.string().min(1, "Mood is required"),
  musicFile: z.instanceof(File).optional(),
  thumbnail: z.instanceof(File).optional(),
});

type MusicFormData = z.infer<typeof musicFormSchema>;

interface MusicFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  music?: MusicType | null;
  onSubmit: (data: MusicFormData) => Promise<void>;
  isLoading: boolean;
}

export function MusicFormModal({
  open,
  onOpenChange,
  music,
  onSubmit,
  isLoading,
}: MusicFormModalProps) {
  const [musicFilePreview, setMusicFilePreview] = useState<string | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  const form = useForm<MusicFormData>({
    resolver: zodResolver(musicFormSchema),
    defaultValues: {
      title: "",
      artists: [""],
      mood: "",
      musicFile: undefined,
      thumbnail: undefined,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "artists" as never,
  });

  useEffect(() => {
    if (music) {
      form.reset({
        title: music.title,
        artists: music.artists.length > 0 ? music.artists : [""],
        mood: music.mood,
        musicFile: undefined,
        thumbnail: undefined,
      });
      setThumbnailPreview(music.imageUrl);
    } else {
      form.reset({
        title: "",
        artists: [""],
        mood: "",
        musicFile: undefined,
        thumbnail: undefined,
      });
      setMusicFilePreview(null);
      setThumbnailPreview(null);
    }
  }, [music, form]);

  const handleMusicFileChange = (file: File | null) => {
    if (file) {
      form.setValue("musicFile", file);
      setMusicFilePreview(file.name);
    } else {
      form.setValue("musicFile", undefined);
      setMusicFilePreview(null);
    }
  };

  const handleThumbnailChange = (file: File | null) => {
    if (file) {
      form.setValue("thumbnail", file);
      const url = URL.createObjectURL(file);
      setThumbnailPreview(url);
    } else {
      form.setValue("thumbnail", undefined);
      setThumbnailPreview(music?.imageUrl || null);
    }
  };

  const handleSubmit = async (data: MusicFormData) => {
    // Validate files for new music
    if (!music && !data.musicFile) {
      form.setError("musicFile", { message: "Music file is required" });
      return;
    }
    if (!music && !data.thumbnail) {
      form.setError("thumbnail", { message: "Thumbnail is required" });
      return;
    }

    try {
      await onSubmit(data);
      onOpenChange(false);
      form.reset();
      setMusicFilePreview(null);
      setThumbnailPreview(null);
    } catch (error) {
      console.log(error);
    }
  };

  const addArtist = () => {
    append("");
  };

  const removeArtist = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{music ? "Edit Music" : "Add New Music"}</DialogTitle>
          <DialogDescription>
            {music
              ? "Update the music details below."
              : "Fill in the details to add new music to the library."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter music title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Artists */}
            <div className="space-y-3">
              <Label>Artists</Label>
              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-2">
                  <FormField
                    control={form.control}
                    name={`artists.${index}`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input placeholder="Enter artist name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeArtist(index)}
                    disabled={fields.length === 1}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addArtist}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Artist
              </Button>
            </div>

            {/* Moods */}
            <FormField
              control={form.control}
              name="mood"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Moods</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a mood" />
                    </SelectTrigger>
                    <SelectContent>
                      {MOODS.map((mood) => (
                        <SelectItem key={mood} value={mood}>
                          {mood.charAt(0).toUpperCase() + mood.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Music File */}
            <FormField
              control={form.control}
              name="musicFile"
              render={() => (
                <FormItem>
                  <FormLabel>Music File {!music && "*"}</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            const input = document.createElement("input");
                            input.type = "file";
                            input.accept = "audio/*";
                            input.onchange = (e) => {
                              const file = (e.target as HTMLInputElement)
                                .files?.[0];
                              handleMusicFileChange(file || null);
                            };
                            input.click();
                          }}
                        >
                          <Music className="h-4 w-4 mr-2" />
                          Choose Music File
                        </Button>
                        {musicFilePreview && (
                          <span className="text-sm text-muted-foreground">
                            {musicFilePreview}
                          </span>
                        )}
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Thumbnail */}
            <FormField
              control={form.control}
              name="thumbnail"
              render={() => (
                <FormItem>
                  <FormLabel>Thumbnail {!music && "*"}</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            const input = document.createElement("input");
                            input.type = "file";
                            input.accept = "image/*";
                            input.onchange = (e) => {
                              const file = (e.target as HTMLInputElement)
                                .files?.[0];
                              handleThumbnailChange(file || null);
                            };
                            input.click();
                          }}
                        >
                          <ImageIcon className="h-4 w-4 mr-2" />
                          Choose Thumbnail
                        </Button>
                      </div>
                      {thumbnailPreview && (
                        <div className="relative w-24 h-24 rounded-lg overflow-hidden border">
                          <img
                            src={thumbnailPreview || "/placeholder.svg"}
                            alt="Thumbnail preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {music ? "Update Music" : "Add Music"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
