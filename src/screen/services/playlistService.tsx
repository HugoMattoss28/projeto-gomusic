import { binUsuariosConfigurado } from '../../constants/config';
import { PlaylistModel } from '../models/PlaylistModel';
import { userService } from './userService';

// Tipo para mapear os erros de validação de cada campo do formulário
export type ErrosPlaylist = Partial<Record<keyof PlaylistModel, string>>;

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

    private static normalizarPlaylist(item: any, uid: string): PlaylistModel {
        return {
            id: String(item.id),
            usuarioId: uid,
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

    // Cadastra uma nova Playlist ligada ao usuário autenticado no JSONBin.io
    static async criar(dados: PlaylistModel, usuarioId?: string): Promise<PlaylistModel> {
        try {
            const uid = this.obterUidUsuario(usuarioId || dados.usuarioId);
            const { usuarios, formato, raizRecord } = await userService.lerEstruturaBin();

            const indiceUsuario = usuarios.findIndex((u) => String(u.id) === String(uid));
            if (indiceUsuario === -1) {
                throw new Error('Usuário não encontrado no JSONBin.io.');
            }

            const playlistsAtuais = Array.isArray(usuarios[indiceUsuario].playlists)
                ? usuarios[indiceUsuario].playlists!
                : [];

            const maiorId = playlistsAtuais.reduce((maior, item) => {
                const num = parseInt(String(item.id), 10);
                return !isNaN(num) && num > maior ? num : maior;
            }, 0);

            const novaPlaylist: PlaylistModel = {
                id: String(maiorId + 1),
                usuarioId: uid,
                nome: dados.nome.trim(),
                descricao: dados.descricao.trim(),
                genero: dados.genero.trim(),
                autor: dados.autor.trim(),
                dataCriacao: dados.dataCriacao.trim(),
                qtdFaixas: typeof dados.qtdFaixas === 'string' ? parseInt(dados.qtdFaixas, 10) : dados.qtdFaixas,
                clima: dados.clima ? dados.clima.trim() : '',
                color: dados.color || '#8B5CF6',
            };

            const usuariosAtualizados = [...usuarios];
            usuariosAtualizados[indiceUsuario] = {
                ...usuarios[indiceUsuario],
                playlists: [...playlistsAtuais, novaPlaylist],
            };

            await userService.salvarEstruturaBin(usuariosAtualizados, formato, raizRecord);
            return novaPlaylist;
        } catch (error) {
            console.error('Erro ao criar playlist no JSONBin.io:', error);
            throw error;
        }
    }

    // Lista todas as playlists pertencentes ao usuário logado no JSONBin.io
    static async listarTodas(usuarioId?: string): Promise<PlaylistModel[]> {
        try {
            const uid = usuarioId || userService.obterUsuarioAtual()?.id;
            if (!uid || !binUsuariosConfigurado()) {
                return [];
            }

            const { usuarios } = await userService.lerEstruturaBin();
            const usuario = usuarios.find((u) => String(u.id) === String(uid));

            if (!usuario || !Array.isArray(usuario.playlists)) {
                return [];
            }

            return usuario.playlists.map((item) => this.normalizarPlaylist(item, uid));
        } catch (error) {
            console.error('Erro ao listar playlists do usuário no JSONBin.io:', error);
            return [];
        }
    }

    // Obtém uma playlist pelo ID dentro do usuário no JSONBin.io
    static async obterPorId(id: string, usuarioId?: string): Promise<PlaylistModel | null> {
        try {
            const lista = await this.listarTodas(usuarioId);
            return lista.find((item) => String(item.id) === String(id)) || null;
        } catch (error) {
            console.error(`Erro ao buscar playlist com ID ${id}:`, error);
            return null;
        }
    }

    // Atualiza uma playlist do usuário autenticado no JSONBin.io
    static async atualizar(id: string, dados: PlaylistModel, usuarioId?: string): Promise<boolean> {
        try {
            const uid = this.obterUidUsuario(usuarioId || dados.usuarioId);
            const { usuarios, formato, raizRecord } = await userService.lerEstruturaBin();

            const indiceUsuario = usuarios.findIndex((u) => String(u.id) === String(uid));
            if (indiceUsuario === -1) {
                throw new Error('Usuário não encontrado no JSONBin.io.');
            }

            const playlistsAtuais = Array.isArray(usuarios[indiceUsuario].playlists)
                ? [...usuarios[indiceUsuario].playlists!]
                : [];

            const indicePlaylist = playlistsAtuais.findIndex((p) => String(p.id) === String(id));
            if (indicePlaylist === -1) {
                throw new Error('Playlist não encontrada.');
            }

            const playlistAtualizada: PlaylistModel = {
                id: String(id),
                usuarioId: uid,
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
                color: dados.color || playlistsAtuais[indicePlaylist].color || '#8B5CF6',
            };

            playlistsAtuais[indicePlaylist] = playlistAtualizada;

            const usuariosAtualizados = [...usuarios];
            usuariosAtualizados[indiceUsuario] = {
                ...usuarios[indiceUsuario],
                playlists: playlistsAtuais,
            };

            await userService.salvarEstruturaBin(usuariosAtualizados, formato, raizRecord);
            return true;
        } catch (error) {
            console.error(`Erro ao atualizar playlist com ID ${id}:`, error);
            throw error;
        }
    }

    // Remove uma playlist do usuário autenticado no JSONBin.io
    static async eliminar(id: string, usuarioId?: string): Promise<boolean> {
        try {
            const uid = this.obterUidUsuario(usuarioId);
            const { usuarios, formato, raizRecord } = await userService.lerEstruturaBin();

            const indiceUsuario = usuarios.findIndex((u) => String(u.id) === String(uid));
            if (indiceUsuario === -1) {
                throw new Error('Usuário não encontrado no JSONBin.io.');
            }

            const playlistsAtuais = Array.isArray(usuarios[indiceUsuario].playlists)
                ? usuarios[indiceUsuario].playlists!
                : [];

            const novasPlaylists = playlistsAtuais.filter((p) => String(p.id) !== String(id));

            const usuariosAtualizados = [...usuarios];
            usuariosAtualizados[indiceUsuario] = {
                ...usuarios[indiceUsuario],
                playlists: novasPlaylists,
            };

            await userService.salvarEstruturaBin(usuariosAtualizados, formato, raizRecord);
            return true;
        } catch (error) {
            console.error(`Erro ao eliminar playlist com ID ${id}:`, error);
            throw error;
        }
    }
}
