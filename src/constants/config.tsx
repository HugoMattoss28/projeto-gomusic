// ==================================================
// CONFIGURAÇÃO DO JSONBIN.IO
// ==================================================

// Bin do catálogo de músicas (tela Catálogo API)
export const BIN_ID = '6ae146cbffd5d16053917681';

// Bin de usuários e playlists — cole abaixo o ID do novo Bin criado no JSONBin.io
export const USERS_BIN_ID = 'COLE_AQUI_O_ID_DO_BIN_DE_USUARIOS';

// Master Key da conta no JSONBin.io
export const API_KEY = '$2a$10$FR79dxvpyvVJJBn5OzGsau.1KngIocFLd8I81jHtsynNnymH6mid2';

// URL de leitura do catálogo de músicas
export const URL = `https://api.jsonbin.io/v3/b/${BIN_ID}/latest`;

// Extrai o ID limpo mesmo que o usuário cole a URL inteira do JSONBin sem querer
export function obterIdBinUsuarios(): string {
  const limpo = USERS_BIN_ID.trim();
  const matchUrl = limpo.match(/\/b\/([a-f0-9]{20,30})/i);
  if (matchUrl) {
    return matchUrl[1];
  }
  return limpo;
}

// Verifica se o ID do Bin de usuários já foi preenchido corretamente
export function binUsuariosConfigurado(): boolean {
  const id = obterIdBinUsuarios();
  return /^[a-f0-9]{20,30}$/i.test(id);
}

// Retorna as URLs de leitura (GET) e escrita (PUT) do Bin de usuários
export function obterUrlsUsuarios() {
  const id = obterIdBinUsuarios();
  return {
    leitura: `https://api.jsonbin.io/v3/b/${id}/latest`,
    escrita: `https://api.jsonbin.io/v3/b/${id}`,
  };
}
