import { PlaylistModel } from './PlaylistModel';

export interface UserModel {
  id: string;
  nome: string;
  celular: string;
  email: string;
  senha?: string;
  createdAt?: string;
  playlists?: PlaylistModel[];
}

export interface UsersJSONBinResponse {
  record:
    | UserModel[]
    | {
        usuarios?: UserModel[];
        record?: UserModel[];
        [key: string]: any;
      };
  metadata?: {
    id?: string;
    private?: boolean;
    createdAt?: string;
  };
}
