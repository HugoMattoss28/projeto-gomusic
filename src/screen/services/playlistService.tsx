// ==================================================
// SERVICE — PLAYLISTS VIA JSONBIN.IO (BIN SEPARADO)
// ==================================================
// Gerencia exclusivamente o Bin de Playlists (PLAYLISTS_BIN_ID),
// vinculando cada playlist ao usuário logado pelo campo `usuarioId`.
// ==================================================

import axios from 'axios';
import {
    API_KEY,
    binPlaylistsConfigurado,
    obterUrlsPlaylists,
} from '../../constants/config';
import { PlaylistModel, PlaylistsJSONBinResponse } from '../models/PlaylistModel';
import { userService } from './userService';

// Tipo para mapear os erros de validação de cada campo do formulário
export type ErrosPlaylist = Partial<Record<keyof PlaylistModel, string>>;

type FormatoBinPlaylists = 'array' | 'playlists' | 'record';

// eslint-disable-next-line import/no-named-as-default-member
const playlistsApi = axios.create({
    headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': API_KEY,
    },
    timeout: 15000,
});

function validarConfiguracaoBinPlaylists(): void {
    if (!binPlaylistsConfigurado()) {
        throw new Error(
            'Configure o PLAYLISTS_BIN_ID em src/constants/config.tsx com o ID do bin de playlists criado no JSONBin.io.'
        );
    }
}

function extrairDadosBinPlaylists(dados: PlaylistsJSONBinResponse | any): {
    playlists: PlaylistModel[];
    formato: FormatoBinPlaylists;
    raizRecord: any;
} {
    if (Array.isArray(dados)) {
        return { playlists: dados, formato: 'array', raizRecord: dados };
    }

    const conteudo = dados?.record !== undefined ? dados.record : dados;

    if (Array.isArray(conteudo)) {
        return { playlists: conteudo, formato: 'array', raizRecord: conteudo };
    }

    if (Array.isArray(conteudo?.playlists)) {
        return { playlists: conteudo.playlists, formato: 'playlists', raizRecord: conteudo };
    }

    if (Array.isArray(conteudo?.record)) {
        return { playlists: conteudo.record, formato: 'record', raizRecord: conteudo };
    }

    return { playlists: [], formato: 'array', raizRecord: [] };
}

function montarPayloadBinPlaylists(
    playlists: PlaylistModel[],
    formato: FormatoBinPlaylists,
    raizOriginal?: any
): any {
    // O JSONBin.io não aceita array vazio `[]` na raiz; se ficar vazio, envia `{ playlists: [] }`
    if (playlists.length === 0) {
        return { playlists: [] };
    }
    if (formato === 'playlists') {
        return {
            ...(typeof raizOriginal === 'object' && !Array.isArray(raizOriginal) ? raizOriginal : {}),
            playlists,
        };
    }
    if (formato === 'record') {
        return {
            ...(typeof raizOriginal === 'object' && !Array.isArray(raizOriginal) ? raizOriginal : {}),
            record: playlists,
        };
    }
    return playlists;
}

export class PlaylistService {
    // Aplica a máscara DD/MM/AAAA na data informada
    static aplicarMascaraData(texto: string): string {
        let limpo = texto.replace(/\D/g, '');
        if (limpo.length > 8) limpo = limpo.substring(0, 8);
        if (limpo.length <= 2) return limpo;
        if (limpo.length <= 4) return `${limpo.substring(0, 2)}/${limpo.substring(2)}`;
        return `${limpo.substring(0, 2)}/${limpo.substring(2, 4)}/${limpo.substring(4)}`;
    }

    // Valida o formato da data DD/MM/AAAA e limites reais
    static validarData(data: string): boolean {
        const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
        const match = data.match(regex);
        if (!match) return false;

        const dia = parseInt(match[1], 10);
        const mes = parseInt(match[2], 10);
        const ano = parseInt(match[3], 10);

        if (mes < 1 || mes > 12) return false;
        if (dia < 1 || dia > 31) return false;
        if (ano < 1900 || ano > 2100) return false;

        const dataObj = new Date(ano, mes - 1, dia);
        return (
            dataObj.getFullYear() === ano &&
            dataObj.getMonth() === mes - 1 &&
            dataObj.getDate() === dia
        );
    }

    // Validação dos campos obrigatórios da entidade
    static validarCampos(dados: PlaylistModel): { valido: boolean; erros: ErrosPlaylist } {
        const erros: ErrosPlaylist = {};

        if (!dados.nome || !dados.nome.trim()) {
            erros.nome = 'Campo obrigatório.';
        }

        if (!dados.descricao || !dados.descricao.trim()) {
            erros.descricao = 'Campo obrigatório.';
        }

        if (!dados.autor || !dados.autor.trim()) {
            erros.autor = 'Campo obrigatório.';
        }

        if (!dados.genero || !dados.genero.trim()) {
            erros.genero = 'Campo obrigatório.';
        }

        if (!dados.dataCriacao || !dados.dataCriacao.trim()) {
            erros.dataCriacao = 'Campo obrigatório.';
        } else if (!this.validarData(dados.dataCriacao)) {
            erros.dataCriacao = 'Informe uma data válida no formato DD/MM/AAAA.';
        }

        if (!dados.qtdFaixas || !String(dados.qtdFaixas).trim()) {
            erros.qtdFaixas = 'Campo obrigatório.';
        } else {
            const qtdNum = parseInt(String(dados.qtdFaixas), 10);
            if (isNaN(qtdNum) || qtdNum <= 0) {
                erros.qtdFaixas = 'A quantidade de faixas deve ser no mínimo 1.';
            }
        }

        return {
            valido: Object.keys(erros).length === 0,
            erros,
        };
    }

    // Retorna o ID do usuário autenticado
    private static obterUidUsuario(usuarioId?: string): string {
        const uid = usuarioId || userService.obterUsuarioAtual()?.id;
        if (!uid) {
            throw new Error('Usuário não autenticado. Faça login para gerenciar playlists.');
        }
        return uid;
    }

    private static normalizarPlaylist(item: any, uidPadrao: string): PlaylistModel {
        return {
            id: String(item.id),
            usuarioId: String(item.usuarioId || uidPadrao),
            nome: item.nome || item.name || '',
            descricao: item.descricao || item.description || '',
            genero: item.genero || item.genre || '',
            autor: item.autor || item.author || '',
            dataCriacao: item.dataCriacao || '',
            qtdFaixas: item.qtdFaixas || 0,
            clima: item.clima || item.mood || '',
            color: item.color || '#8B5CF6',
        };
    }

    private static async lerBinPlaylists() {
        validarConfiguracaoBinPlaylists();
        const { leitura } = obterUrlsPlaylists();
        const response = await playlistsApi.get<PlaylistsJSONBinResponse>(leitura);
        return extrairDadosBinPlaylists(response.data);
    }

    private static async salvarBinPlaylists(
        playlists: PlaylistModel[],
        formato: FormatoBinPlaylists,
        raizOriginal?: any
    ): Promise<void> {
        validarConfiguracaoBinPlaylists();
        const { escrita } = obterUrlsPlaylists();
        const payload = montarPayloadBinPlaylists(playlists, formato, raizOriginal);
        await playlistsApi.put(escrita, payload);
    }

    // Cadastra uma nova Playlist no Bin de Playlists (PLAYLISTS_BIN_ID) ligada ao usuário autenticado
    static async criar(dados: PlaylistModel, usuarioId?: string): Promise<PlaylistModel> {
        try {
            const uid = this.obterUidUsuario(usuarioId || dados.usuarioId);
            const { playlists, formato, raizRecord } = await this.lerBinPlaylists();

            const maiorId = playlists.reduce((maior, item) => {
                const num = parseInt(String(item.id), 10);
                return !isNaN(num) && num > maior ? num : maior;
            }, 0);

            const novaPlaylist: PlaylistModel = {
                id: String(maiorId + 1),
                usuarioId: String(uid),
                nome: dados.nome.trim(),
                descricao: dados.descricao.trim(),
                genero: dados.genero.trim(),
                autor: dados.autor.trim(),
                dataCriacao: dados.dataCriacao.trim(),
                qtdFaixas: typeof dados.qtdFaixas === 'string' ? parseInt(dados.qtdFaixas, 10) : dados.qtdFaixas,
                clima: dados.clima ? dados.clima.trim() : '',
                color: dados.color || '#8B5CF6',
            };

            const novaLista = [...playlists, novaPlaylist];
            await this.salvarBinPlaylists(novaLista, formato, raizRecord);

            return novaPlaylist;
        } catch (error) {
            console.error('Erro ao criar playlist no JSONBin.io:', error);
            throw error;
        }
    }

    // Lista todas as playlists pertencentes ao usuário logado a partir do Bin de Playlists (PLAYLISTS_BIN_ID)
    static async listarTodas(usuarioId?: string): Promise<PlaylistModel[]> {
        try {
            const uid = usuarioId || userService.obterUsuarioAtual()?.id;
            if (!uid || !binPlaylistsConfigurado()) {
                return [];
            }

            const { playlists } = await this.lerBinPlaylists();

            return playlists
                .filter((item) => !item.usuarioId || String(item.usuarioId) === String(uid))
                .map((item) => this.normalizarPlaylist(item, String(uid)));
        } catch (error) {
            console.error('Erro ao listar playlists do usuário no JSONBin.io:', error);
            return [];
        }
    }

    // Obtém uma playlist pelo ID no Bin de Playlists
    static async obterPorId(id: string, usuarioId?: string): Promise<PlaylistModel | null> {
        try {
            const lista = await this.listarTodas(usuarioId);
            return lista.find((item) => String(item.id) === String(id)) || null;
        } catch (error) {
            console.error(`Erro ao buscar playlist com ID ${id}:`, error);
            return null;
        }
    }

    // Atualiza uma playlist no Bin de Playlists (PLAYLISTS_BIN_ID)
    static async atualizar(id: string, dados: PlaylistModel, usuarioId?: string): Promise<boolean> {
        try {
            const uid = this.obterUidUsuario(usuarioId || dados.usuarioId);
            const { playlists, formato, raizRecord } = await this.lerBinPlaylists();

            const indice = playlists.findIndex(
                (p) =>
                    String(p.id) === String(id) &&
                    (!p.usuarioId || String(p.usuarioId) === String(uid))
            );

            if (indice === -1) {
                throw new Error('Playlist não encontrada no bin.');
            }

            const playlistAtualizada: PlaylistModel = {
                id: String(id),
                usuarioId: String(uid),
                nome: dados.nome.trim(),
                descricao: dados.descricao.trim(),
                genero: dados.genero.trim(),
                autor: dados.autor.trim(),
                dataCriacao: dados.dataCriacao ? dados.dataCriacao.trim() : '',
                qtdFaixas: dados.qtdFaixas
                    ? typeof dados.qtdFaixas === 'string'
                        ? parseInt(dados.qtdFaixas, 10)
                        : dados.qtdFaixas
                    : 0,
                clima: dados.clima ? dados.clima.trim() : '',
                color: dados.color || playlists[indice].color || '#8B5CF6',
            };

            const novaLista = [...playlists];
            novaLista[indice] = playlistAtualizada;

            await this.salvarBinPlaylists(novaLista, formato, raizRecord);
            return true;
        } catch (error) {
            console.error(`Erro ao atualizar playlist com ID ${id}:`, error);
            throw error;
        }
    }

    // Remove uma playlist do Bin de Playlists (PLAYLISTS_BIN_ID)
    static async eliminar(id: string, usuarioId?: string): Promise<boolean> {
        try {
            const uid = this.obterUidUsuario(usuarioId);
            const { playlists, formato, raizRecord } = await this.lerBinPlaylists();

            const novaLista = playlists.filter(
                (p) =>
                    !(
                        String(p.id) === String(id) &&
                        (!p.usuarioId || String(p.usuarioId) === String(uid))
                    )
            );

            await this.salvarBinPlaylists(novaLista, formato, raizRecord);
            return true;
        } catch (error) {
            console.error(`Erro ao eliminar playlist com ID ${id}:`, error);
            throw error;
        }
    }
}
