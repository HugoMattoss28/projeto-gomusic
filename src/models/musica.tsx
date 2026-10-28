// ==================================================
// MODEL — MÚSICAS JSON (JSONBin.io)
// ==================================================
// Representa o catálogo de músicas do app (goMusic)
// para consumo e persistência via API do JSONBin.io.
// ==================================================

export interface MusicaJson {
  /** Identificador único sequencial da música (1, 2, 3...) */
  id: string | number;

  /** Nome/título da música. Ex: "Starboy" */
  nome: string;

  /** Nome do artista ou banda. Ex: "The Weeknd" */
  artista: string;

  /** Nome do álbum ao qual a música pertence. Ex: "After Hours" */
  album: string;

  /** Gênero musical: "Pop" | "Trap" | "MPB" | "Rock" | "Sertanejo" | "Lo-fi" */
  genero: string;

  /** Duração da faixa no formato MM:SS. Ex: "3:50" */
  duracao: string;

  /** URL da capa do álbum ou imagem representativa da música */
  imagem: string;

  /** Data e hora de criação do registro (ISO 8601) */
  criadoEm?: string;

  /** Data e hora de criação alternativa (compatibilidade com padrão createdAt) */
  createdAt?: string;

  /** Nome de quem cadastrou a música */
  criadoPor?: string;

  /** E-mail do usuário que cadastrou */
  usuarioEmail?: string;

  /** UID do usuário */
  usuarioId?: string;

  /** Data e hora da última alteração (ISO 8601) */
  atualizadoEm?: string;
}

// ==================================================
// RESPOSTA DO JSONBIN.IO (Padrão de API)
// ==================================================
export interface JSONBinResponse {
  record:
    | MusicaJson[]
    | {
        record: MusicaJson[];
        [key: string]: any;
      };
  metadata?: {
    id?: string;
    private?: boolean;
    createdAt?: string;
  };
}


// Aliases para compatibilidade total com o padrão da aula e do app
export type MusicaModel = MusicaJson;
export type Musica = MusicaJson;
export type Musicas = MusicaJson;
export type Servicos = MusicaJson;
