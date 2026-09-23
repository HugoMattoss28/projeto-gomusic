import React, { createContext, ReactNode, useContext, useState } from 'react';

export interface Playlist {
  id: string;
  name: string;
  description: string;
  genre: string;
  author: string;
  mood: string;
  color?: string;
}

interface PlaylistContextData {
  playlists: Playlist[];
  addPlaylist: (playlist: Omit<Playlist, 'id'>) => void;
  updatePlaylist: (id: string, updatedPlaylist: Omit<Playlist, 'id'>) => void;
  deletePlaylist: (id: string) => void;
}

const PlaylistContext = createContext<PlaylistContextData>({} as PlaylistContextData);

const defaultColors = ['#8B5CF6', '#10B981', '#3B82F6', '#F59E0B', '#EF4444'];

export const PlaylistProvider = ({ children }: { children: ReactNode }) => {
  const [playlists, setPlaylists] = useState<Playlist[]>([
    { 
      id: "1", 
      name: "Trap & Phonk", 
      description: "Músicas para treinar", 
      genre: "Trap", 
      author: "Veigh", 
      mood: "Focado",
      color: "#8B5CF6"
    },
    { 
      id: "2", 
      name: "Foco total", 
      description: "Instrumental para estudo", 
      genre: "Lo-fi", 
      author: "Lofi Girl", 
      mood: "Calmo",
      color: "#10B981"
    },
  ]);

  const addPlaylist = (playlistData: Omit<Playlist, 'id'>) => {
    const randomColor = defaultColors[Math.floor(Math.random() * defaultColors.length)];
    const newPlaylist: Playlist = {
      ...playlistData,
      id: Date.now().toString(),
      color: randomColor,
    };
    setPlaylists([...playlists, newPlaylist]);
  };

  const updatePlaylist = (id: string, updatedData: Omit<Playlist, 'id'>) => {
    setPlaylists((currentPlaylists) => 
      currentPlaylists.map(p => 
        p.id === id ? { ...p, ...updatedData } : p
      )
    );
  };

  const deletePlaylist = (id: string) => {
    setPlaylists((currentPlaylists) => currentPlaylists.filter(p => p.id !== id));
  };

  return (
    <PlaylistContext.Provider value={{ playlists, addPlaylist, updatePlaylist, deletePlaylist }}>
      {children}
    </PlaylistContext.Provider>
  );
};

export const usePlaylists = () => {
  const context = useContext(PlaylistContext);
  if (!context) {
    throw new Error('usePlaylists deve ser usado dentro de um PlaylistProvider');
  }
  return context;
};

