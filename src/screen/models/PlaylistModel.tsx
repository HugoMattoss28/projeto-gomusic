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

export interface PlaylistsJSONBinResponse {
    record:
        | PlaylistModel[]
        | {
              playlists?: PlaylistModel[];
              record?: PlaylistModel[];
              [key: string]: any;
          };
    metadata?: {
        id?: string;
        private?: boolean;
        createdAt?: string;
    };
}
