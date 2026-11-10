import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { PlaylistModel } from '../screen/models/PlaylistModel';
import { PlaylistService } from '../screen/services/playlistService';
import { userService } from '../screen/services/userService';

export type Playlist = PlaylistModel & { id: string };

interface PlaylistContextData {
  playlists: Playlist[];
  carregarPlaylists: (uid?: string) => Promise<void>;
  addPlaylist: (playlist: PlaylistModel) => Promise<PlaylistModel>;
  updatePlaylist: (id: string, updatedPlaylist: PlaylistModel) => Promise<boolean>;
  deletePlaylist: (id: string) => Promise<boolean>;
}

const PlaylistContext = createContext<PlaylistContextData>({} as PlaylistContextData);

const defaultColors = ['#8B5CF6', '#10B981', '#3B82F6', '#F59E0B', '#EF4444'];

export const PlaylistProvider = ({ children }: { children: ReactNode }) => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  const carregarPlaylists = useCallback(async (uid?: string) => {
    try {
      const userId = uid || userService.obterUsuarioAtual()?.id;
      if (!userId) {
        setPlaylists([]);
        return;
      }
      const dados = await PlaylistService.listarTodas(userId);
      setPlaylists(dados as Playlist[]);
    } catch (error) {
      console.log('Erro ao carregar playlists do usuário:', error);
    }
  }, []);

  useEffect(() => {
    // Monitora o estado de autenticação para carregar apenas as playlists do usuário logado (usuario -> playlist)
    const unsubscribe = userService.onAuthChange((user) => {
      if (user) {
        carregarPlaylists(user.id);
      } else {
        setPlaylists([]);
      }
    });

    return () => unsubscribe();
  }, [carregarPlaylists]);

  const addPlaylist = useCallback(async (playlistData: PlaylistModel) => {
    const randomColor = defaultColors[Math.floor(Math.random() * defaultColors.length)];
    const criada = await PlaylistService.criar({
      ...playlistData,
      color: playlistData.color || randomColor,
    });
    await carregarPlaylists();
    return criada;
  }, [carregarPlaylists]);

  const updatePlaylist = useCallback(async (id: string, updatedData: PlaylistModel) => {
    const sucesso = await PlaylistService.atualizar(id, updatedData);
    await carregarPlaylists();
    return sucesso;
  }, [carregarPlaylists]);

  const deletePlaylist = useCallback(async (id: string) => {
    const sucesso = await PlaylistService.eliminar(id);
    await carregarPlaylists();
    return sucesso;
  }, [carregarPlaylists]);

  return (
    <PlaylistContext.Provider value={{ playlists, carregarPlaylists, addPlaylist, updatePlaylist, deletePlaylist }}>
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
