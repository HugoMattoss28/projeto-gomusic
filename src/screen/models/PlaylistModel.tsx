export interface PlaylistModel {
    id?: string;
    usuarioId?: string; // ID do usuário dono da playlist (vinculado: usuario -> playlist)
    nome: string;
    descricao: string;
    genero: string;
    autor: string;
    dataCriacao: string;
    qtdFaixas: number | string;
    clima?: string;
    color?: string;
}
