// ==================================================
// SERVICE — INTEGRAÇÃO COM API EXTERNA (JSONBin.io)
// ==================================================
// Consumo e persistência do catálogo de músicas do goMusic
// utilizando Axios e a API v3 do JSONBin.io.
// ==================================================

import axios from "axios";
import { API_KEY, BIN_ID, URL } from "../constants/config";
import { JSONBinResponse, MusicaJson } from "../models/musica";
import { auth } from "../screen/services/firebaseConfig";

// URL base para escrita (PUT no JSONBin v3 não utiliza o sufixo /latest)
const WRITE_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

// Instância configurada do Axios com os cabeçalhos exigidos pelo JSONBin.io
export const api = axios.create({
  headers: {
    "Content-Type": "application/json",
    "X-Master-Key": API_KEY,
  },
  timeout: 15000,
});

// Extrai o array de músicas independentemente de o bin estar na raiz ou aninhado em { record: [...] }
function extrairMusicas(dados: JSONBinResponse | any): MusicaJson[] {
  if (Array.isArray(dados)) {
    return dados;
  }
  if (Array.isArray(dados?.record)) {
    return dados.record;
  }
  if (Array.isArray(dados?.record?.record)) {
    return dados.record.record;
  }
  return [];
}

// Verifica se o bin original estava envelopado em { record: [...] } para preservar a estrutura no PUT
function binEstaEnvelopado(dados: JSONBinResponse | any): boolean {
  return !Array.isArray(dados?.record) && Array.isArray(dados?.record?.record);
}

// ==================================================
// FUNÇÕES DE CRUD NA API (JSONBIN.IO)
// ==================================================

/** Busca todas as músicas cadastradas no JSONBin.io (GET) */
export async function listarMusicas(): Promise<MusicaJson[]> {
  try {
    const response = await api.get<JSONBinResponse>(URL);
    return extrairMusicas(response.data);
  } catch (error) {
    console.error("Erro ao buscar músicas no JSONBin.io:", error);
    throw new Error("Não foi possível carregar as músicas da API.");
  }
}

/** Obtém uma música específica pelo ID */
export async function obterMusicaPorId(id: string | number): Promise<MusicaJson | null> {
  const musicas = await listarMusicas();
  return musicas.find((item) => String(item.id) === String(id)) || null;
}

/** Cadastra uma nova música no JSONBin.io (PUT com a lista atualizada) */
export async function criarMusica(
  nova: Omit<MusicaJson, "id">
): Promise<MusicaJson> {
  try {
    const responseAtual = await api.get<JSONBinResponse>(URL);
    const musicasAtuais = extrairMusicas(responseAtual.data);
    const envelopado = binEstaEnvelopado(responseAtual.data);

    // Calcula o próximo ID sequencial
    const maiorId = musicasAtuais.reduce((maior, item) => {
      const num = parseInt(String(item.id), 10);
      return !isNaN(num) && num > maior ? num : maior;
    }, 0);

    const agora = new Date().toISOString();
    const usuarioAtual = auth.currentUser;

    const novaMusica: MusicaJson = {
      id: String(maiorId + 1),
      nome: nova.nome.trim(),
      artista: nova.artista.trim(),
      album: nova.album.trim(),
      genero: nova.genero.trim(),
      duracao: nova.duracao.trim(),
      imagem:
        nova.imagem?.trim() ||
        "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=500",
      createdAt: agora,
      criadoEm: agora,
      criadoPor:
        nova.criadoPor ||
        usuarioAtual?.displayName ||
        usuarioAtual?.email ||
        "Usuário goMusic",
      usuarioEmail: usuarioAtual?.email || undefined,
      usuarioId: usuarioAtual?.uid || undefined,
    };

    const novaLista = [...musicasAtuais, novaMusica];
    const payload = envelopado ? { record: novaLista } : novaLista;

    await api.put(WRITE_URL, payload);
    return novaMusica;
  } catch (error) {
    console.error("Erro ao cadastrar música no JSONBin.io:", error);
    throw new Error("Não foi possível cadastrar a música na API.");
  }
}

/** Atualiza uma música existente no JSONBin.io pelo ID (PUT) */
export async function atualizarMusica(
  id: string | number,
  dadosAtualizados: Partial<MusicaJson>
): Promise<MusicaJson> {
  try {
    const responseAtual = await api.get<JSONBinResponse>(URL);
    const musicasAtuais = extrairMusicas(responseAtual.data);
    const envelopado = binEstaEnvelopado(responseAtual.data);

    const indice = musicasAtuais.findIndex(
      (item) => String(item.id) === String(id)
    );

    if (indice === -1) {
      throw new Error("Música não encontrada no bin.");
    }

    const musicaEditada: MusicaJson = {
      ...musicasAtuais[indice],
      ...dadosAtualizados,
      id: String(id),
      nome: (dadosAtualizados.nome ?? musicasAtuais[indice].nome).trim(),
      artista: (dadosAtualizados.artista ?? musicasAtuais[indice].artista).trim(),
      album: (dadosAtualizados.album ?? musicasAtuais[indice].album).trim(),
      genero: (dadosAtualizados.genero ?? musicasAtuais[indice].genero).trim(),
      duracao: (dadosAtualizados.duracao ?? musicasAtuais[indice].duracao).trim(),
      imagem:
        dadosAtualizados.imagem?.trim() ||
        musicasAtuais[indice].imagem ||
        "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=500",
      atualizadoEm: new Date().toISOString(),
    };

    const novaLista = [...musicasAtuais];
    novaLista[indice] = musicaEditada;

    const payload = envelopado ? { record: novaLista } : novaLista;
    await api.put(WRITE_URL, payload);

    return musicaEditada;
  } catch (error) {
    console.error(`Erro ao atualizar música ${id} no JSONBin.io:`, error);
    throw new Error("Não foi possível atualizar a música na API.");
  }
}

/** Remove uma música do JSONBin.io pelo ID (PUT) */
export async function excluirMusica(id: string | number): Promise<boolean> {
  try {
    const responseAtual = await api.get<JSONBinResponse>(URL);
    const musicasAtuais = extrairMusicas(responseAtual.data);
    const envelopado = binEstaEnvelopado(responseAtual.data);

    const novaLista = musicasAtuais.filter(
      (item) => String(item.id) !== String(id)
    );

    if (novaLista.length === 0) {
      throw new Error(
        "O JSONBin.io não permite deixar o bin totalmente vazio. Mantenha ao menos 1 música."
      );
    }

    const payload = envelopado ? { record: novaLista } : novaLista;
    await api.put(WRITE_URL, payload);

    return true;
  } catch (error: any) {
    console.error(`Erro ao excluir música ${id} no JSONBin.io:`, error);
    throw new Error(
      error?.message || "Não foi possível excluir a música na API."
    );
  }
}

// Classe utilitária compatível com o padrão de Services do projeto (ex: PlaylistService)
export class ApiService {
  static listarTodas = listarMusicas;
  static obterPorId = obterMusicaPorId;
  static criar = criarMusica;
  static atualizar = atualizarMusica;
  static eliminar = excluirMusica;
}

export default api;

