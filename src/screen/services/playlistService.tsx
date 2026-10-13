import { child, get, push, ref, remove, set, update } from 'firebase/database';
import { PlaylistModel } from '../models/PlaylistModel';
import { auth, database } from '../services/firebaseConfig';

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

        return true;
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

    // Retorna o UID do usuário autenticado no Firebase
    private static obterUidUsuario(usuarioId?: string): string {
        const uid = usuarioId || auth.currentUser?.uid;
        if (!uid) {
            throw new Error('Usuário não autenticado. Faça login para gerenciar playlists.');
        }
        return uid;
    }

    // Cadastra uma nova Playlist ligada ao usuário autenticado: usuarios/{uid}/playlists/{id}
    static async criar(dados: PlaylistModel, usuarioId?: string): Promise<PlaylistModel> {
        try {
            const uid = this.obterUidUsuario(usuarioId || dados.usuarioId);
            const userPlaylistsRef = ref(database, `usuarios/${uid}/playlists`);

            // Gera uma chave/ID única no nó de playlists do usuário
            const novaPlaylistRef = push(userPlaylistsRef);
            const novoId = novaPlaylistRef.key;

            if (!novoId) {
                throw new Error('Não foi possível gerar um ID único no Firebase.');
            }

            // Apenas campos em português, sem duplicação
            const novaPlaylist: PlaylistModel = {
                id: novoId,
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

            await set(novaPlaylistRef, novaPlaylist);

            // Se ainda existir o nó raiz antigo 'playlists', limpa o item de teste duplicado
            try {
                const raizAntigaRef = ref(database, 'playlists');
                const snapshotRaiz = await get(raizAntigaRef);
                if (snapshotRaiz.exists()) {
                    await remove(raizAntigaRef);
                }
            } catch (_) {}

            return novaPlaylist;
        } catch (error) {
            console.error('Erro ao criar playlist no Firebase:', error);
            throw error;
        }
    }

    // Lista todas as playlists pertencentes ao usuário logado: usuarios/{uid}/playlists
    static async listarTodas(usuarioId?: string): Promise<PlaylistModel[]> {
        try {
            const uid = usuarioId || auth.currentUser?.uid;
            if (!uid) {
                return [];
            }

            const dbRef = ref(database);
            const snapshot = await get(child(dbRef, `usuarios/${uid}/playlists`));

            const lista: PlaylistModel[] = [];

            if (snapshot.exists()) {
                const data = snapshot.val();
                Object.keys(data).forEach((key) => {
                    const item = data[key];
                    lista.push({
                        id: key,
                        usuarioId: uid,
                        nome: item.nome || item.name || '',
                        descricao: item.descricao || item.description || '',
                        genero: item.genero || item.genre || '',
                        autor: item.autor || item.author || '',
                        dataCriacao: item.dataCriacao || '',
                        qtdFaixas: item.qtdFaixas || 0,
                        clima: item.clima || item.mood || '',
                        color: item.color || '#8B5CF6',
                    });
                });
                return lista;
            }

            // Se o usuário ainda não tiver playlists, verifica se há playlist órfã no nó raiz 'playlists' e migra para o usuário
            try {
                const snapshotRaiz = await get(child(dbRef, 'playlists'));
                if (snapshotRaiz.exists()) {
                    const dataRaiz = snapshotRaiz.val();
                    for (const key of Object.keys(dataRaiz)) {
                        const item = dataRaiz[key];
                        const playlistMigrada: PlaylistModel = {
                            id: key,
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

                        // Salva no nó do usuário
                        await set(ref(database, `usuarios/${uid}/playlists/${key}`), playlistMigrada);
                        lista.push(playlistMigrada);
                    }
                    // Remove o nó raiz 'playlists' antigo para limpar o banco
                    await remove(ref(database, 'playlists'));
                }
            } catch (_) {}

            return lista;
        } catch (error) {
            console.error('Erro ao listar playlists do usuário no Firebase:', error);
            return [];
        }
    }

    // Obtém uma playlist pelo ID dentro do nó do usuário: usuarios/{uid}/playlists/{id}
    static async obterPorId(id: string, usuarioId?: string): Promise<PlaylistModel | null> {
        try {
            const uid = this.obterUidUsuario(usuarioId);
            const dbRef = ref(database);
            const snapshot = await get(child(dbRef, `usuarios/${uid}/playlists/${id}`));

            if (snapshot.exists()) {
                const item = snapshot.val();
                return {
                    id,
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

            return null;
        } catch (error) {
            console.error(`Erro ao buscar playlist com ID ${id}:`, error);
            return null;
        }
    }

    // Atualiza uma playlist do usuário autenticado: usuarios/{uid}/playlists/{id}
    static async atualizar(id: string, dados: PlaylistModel, usuarioId?: string): Promise<boolean> {
        try {
            const uid = this.obterUidUsuario(usuarioId || dados.usuarioId);
            const playlistRef = ref(database, `usuarios/${uid}/playlists/${id}`);

            // Apenas campos em português, sem duplicação
            const dadosAtualizados: PlaylistModel = {
                id,
                usuarioId: uid,
                nome: dados.nome.trim(),
                descricao: dados.descricao.trim(),
                genero: dados.genero.trim(),
                autor: dados.autor.trim(),
                dataCriacao: dados.dataCriacao ? dados.dataCriacao.trim() : '',
                qtdFaixas: dados.qtdFaixas ? (typeof dados.qtdFaixas === 'string' ? parseInt(dados.qtdFaixas, 10) : dados.qtdFaixas) : 0,
                clima: dados.clima ? dados.clima.trim() : '',
                color: dados.color || '#8B5CF6',
            };

            await set(playlistRef, dadosAtualizados);
            return true;
        } catch (error) {
            console.error(`Erro ao atualizar playlist com ID ${id}:`, error);
            throw error;
        }
    }

    // Remove uma playlist do usuário autenticado: usuarios/{uid}/playlists/{id}
    static async eliminar(id: string, usuarioId?: string): Promise<boolean> {
        try {
            const uid = this.obterUidUsuario(usuarioId);
            const playlistRef = ref(database, `usuarios/${uid}/playlists/${id}`);
            await remove(playlistRef);
            return true;
        } catch (error) {
            console.error(`Erro ao eliminar playlist com ID ${id}:`, error);
            throw error;
        }
    }
}
