// ==================================================
// CONFIGURAÇÃO DO JSONBIN.IO (3 BINS SEPARADOS)
// ==================================================

// 1. Bin do catálogo de músicas (tela Catálogo API)
export const BIN_ID = '6ae146cbffd5d16053917681';

// 2. Bin exclusivo de usuários (Login e Cadastro)
export const USERS_BIN_ID = '6aea86edac6210605a6a600c';

// 3. Bin exclusivo de playlists (CRUD de Playlists)
export const PLAYLISTS_BIN_ID = '6af264d6ac6210605a7b69a3';

// Master Key da conta no JSONBin.io
export const API_KEY = '$2a$10$FR79dxvpyvVJJBn5OzGsau.1KngIocFLd8I81jHtsynNnymH6mid2';

// URLs de leitura padrão
export const URL = `https://api.jsonbin.io/v3/b/${BIN_ID}/latest`;
export const USERS_URL = `https://api.jsonbin.io/v3/b/${USERS_BIN_ID}/latest`;
export const PLAYLISTS_URL = `https://api.jsonbin.io/v3/b/${PLAYLISTS_BIN_ID}/latest`;

// Extrai o ID limpo mesmo que o usuário cole a URL inteira do JSONBin sem querer
function extrairIdLimpo(valor: string): string {
  const limpo = valor.trim();
  const matchUrl = limpo.match(/\/b\/([a-f0-9]{20,30})/i);
  if (matchUrl) {
    return matchUrl[1];
  }
  return limpo;
}

export function obterIdBinUsuarios(): string {
  return extrairIdLimpo(USERS_BIN_ID);
}

export function binUsuariosConfigurado(): boolean {
  return /^[a-f0-9]{20,30}$/i.test(obterIdBinUsuarios());
}

export function obterUrlsUsuarios() {
  const id = obterIdBinUsuarios();
  return {
    leitura: `https://api.jsonbin.io/v3/b/${id}/latest`,
    escrita: `https://api.jsonbin.io/v3/b/${id}`,
  };
}

export function obterIdBinPlaylists(): string {
  return extrairIdLimpo(PLAYLISTS_BIN_ID);
}

export function binPlaylistsConfigurado(): boolean {
  return /^[a-f0-9]{20,30}$/i.test(obterIdBinPlaylists());
}

export function obterUrlsPlaylists() {
  const id = obterIdBinPlaylists();
  return {
    leitura: `https://api.jsonbin.io/v3/b/${id}/latest`,
    escrita: `https://api.jsonbin.io/v3/b/${id}`,
  };
}
