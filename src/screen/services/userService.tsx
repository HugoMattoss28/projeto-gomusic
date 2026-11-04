// ==================================================
// SERVICE — USUÁRIOS E AUTENTICAÇÃO VIA JSONBIN.IO
// ==================================================

import axios from 'axios';
import {
  API_KEY,
  binUsuariosConfigurado,
  obterUrlsUsuarios,
} from '../../constants/config';
import { UserModel, UsersJSONBinResponse } from '../models/UserModel';

type FormatoBinUsuarios = 'array' | 'usuarios' | 'record';
type AuthListener = (usuario: UserModel | null) => void;

const CHAVE_SESSAO_WEB = '@gomusic:usuario_logado';

// eslint-disable-next-line import/no-named-as-default-member
const usersApi = axios.create({
  headers: {
    'Content-Type': 'application/json',
    'X-Master-Key': API_KEY,
  },
  timeout: 15000,
});

function criarErroAuth(codigo: string, mensagem: string): Error & { code: string } {
  const erro = new Error(mensagem) as Error & { code: string };
  erro.code = codigo;
  return erro;
}

function validarConfiguracaoBinUsuarios(): void {
  if (!binUsuariosConfigurado()) {
    throw criarErroAuth(
      'config/missing-bin-id',
      'Configure o USERS_BIN_ID em src/constants/config.tsx com o ID do bin criado no JSONBin.io.'
    );
  }
}

// Extrai o array de usuários independentemente de o bin estar na raiz [...], em { usuarios: [...] } ou em { record: [...] }
export function extrairDadosBinUsuarios(dados: UsersJSONBinResponse | any): {
  usuarios: UserModel[];
  formato: FormatoBinUsuarios;
  raizRecord: any;
} {
  if (Array.isArray(dados)) {
    return { usuarios: dados, formato: 'array', raizRecord: dados };
  }

  const conteudo = dados?.record !== undefined ? dados.record : dados;

  if (Array.isArray(conteudo)) {
    return { usuarios: conteudo, formato: 'array', raizRecord: conteudo };
  }

  if (Array.isArray(conteudo?.usuarios)) {
    return { usuarios: conteudo.usuarios, formato: 'usuarios', raizRecord: conteudo };
  }

  if (Array.isArray(conteudo?.record)) {
    return { usuarios: conteudo.record, formato: 'record', raizRecord: conteudo };
  }

  return { usuarios: [], formato: 'array', raizRecord: [] };
}

export function montarPayloadBinUsuarios(
  usuarios: UserModel[],
  formato: FormatoBinUsuarios,
  raizOriginal?: any
): any {
  if (formato === 'usuarios') {
    return {
      ...(typeof raizOriginal === 'object' && !Array.isArray(raizOriginal) ? raizOriginal : {}),
      usuarios,
    };
  }
  if (formato === 'record') {
    return {
      ...(typeof raizOriginal === 'object' && !Array.isArray(raizOriginal) ? raizOriginal : {}),
      record: usuarios,
    };
  }
  return usuarios;
}

class UserService {
  private usuarioAtual: UserModel | null = null;
  private listeners: Set<AuthListener> = new Set();

  constructor() {
    this.restaurarSessaoWeb();
  }

  private restaurarSessaoWeb(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const salvo = window.localStorage.getItem(CHAVE_SESSAO_WEB);
        if (salvo) {
          this.usuarioAtual = JSON.parse(salvo);
        }
      }
    } catch {}
  }

  private persistirSessaoWeb(usuario: UserModel | null): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        if (usuario) {
          window.localStorage.setItem(CHAVE_SESSAO_WEB, JSON.stringify(usuario));
        } else {
          window.localStorage.removeItem(CHAVE_SESSAO_WEB);
        }
      }
    } catch {}
  }

  obterUsuarioAtual(): UserModel | null {
    return this.usuarioAtual;
  }

  definirUsuarioAtual(usuario: UserModel | null): void {
    if (usuario) {
      const { senha: _, ...semSenha } = usuario;
      this.usuarioAtual = semSenha;
    } else {
      this.usuarioAtual = null;
    }

    this.persistirSessaoWeb(this.usuarioAtual);
    this.listeners.forEach((listener) => listener(this.usuarioAtual));
  }

  // Substitui o onAuthStateChanged do Firebase
  onAuthChange(listener: AuthListener): () => void {
    this.listeners.add(listener);
    listener(this.usuarioAtual);
    return () => {
      this.listeners.delete(listener);
    };
  }

  async lerEstruturaBin() {
    validarConfiguracaoBinUsuarios();
    const { leitura } = obterUrlsUsuarios();
    const response = await usersApi.get<UsersJSONBinResponse>(leitura);
    return extrairDadosBinUsuarios(response.data);
  }

  async salvarEstruturaBin(
    usuarios: UserModel[],
    formato: FormatoBinUsuarios,
    raizOriginal?: any
  ): Promise<void> {
    validarConfiguracaoBinUsuarios();
    const { escrita } = obterUrlsUsuarios();
    const payload = montarPayloadBinUsuarios(usuarios, formato, raizOriginal);
    await usersApi.put(escrita, payload);
  }

  // Cadastrar novo usuário no JSONBin.io
  async cadastrarUsuario(
    nome: string,
    celular: string,
    email: string,
    senha: string
  ): Promise<UserModel> {
    validarConfiguracaoBinUsuarios();

    try {
      const { usuarios, formato, raizRecord } = await this.lerEstruturaBin();
      const emailNormalizado = email.trim().toLowerCase();

      const emailJaExiste = usuarios.some(
        (u) => u.email?.trim().toLowerCase() === emailNormalizado
      );

      if (emailJaExiste) {
        throw criarErroAuth(
          'auth/email-already-in-use',
          'Este e-mail já está cadastrado.'
        );
      }

      const maiorId = usuarios.reduce((maior, item) => {
        const num = parseInt(String(item.id), 10);
        return !isNaN(num) && num > maior ? num : maior;
      }, 0);

      const novoUsuario: UserModel = {
        id: String(maiorId + 1),
        nome: nome.trim(),
        celular: celular.trim(),
        email: emailNormalizado,
        senha,
        createdAt: new Date().toISOString(),
        playlists: [],
      };

      const novaLista = [...usuarios, novoUsuario];
      await this.salvarEstruturaBin(novaLista, formato, raizRecord);

      const { senha: _, ...usuarioRetorno } = novoUsuario;
      return usuarioRetorno;
    } catch (error: any) {
      if (error?.code) {
        throw error;
      }
      console.error('Erro ao cadastrar usuário no JSONBin.io:', error);
      throw criarErroAuth(
        'api/register-failed',
        'Não foi possível realizar o cadastro no JSONBin.io. Verifique sua conexão e o ID do bin.'
      );
    }
  }

  // Autenticar usuário consultando o JSONBin.io
  async login(email: string, senha: string): Promise<UserModel> {
    validarConfiguracaoBinUsuarios();

    try {
      const { usuarios } = await this.lerEstruturaBin();
      const emailNormalizado = email.trim().toLowerCase();

      const usuarioEncontrado = usuarios.find(
        (u) => u.email?.trim().toLowerCase() === emailNormalizado
      );

      if (!usuarioEncontrado || usuarioEncontrado.senha !== senha) {
        throw criarErroAuth(
          'auth/invalid-credential',
          'Usuário não encontrado ou senha incorreta.'
        );
      }

      this.definirUsuarioAtual(usuarioEncontrado);
      return this.usuarioAtual!;
    } catch (error: any) {
      if (error?.code) {
        throw error;
      }
      console.error('Erro ao autenticar usuário no JSONBin.io:', error);
      throw criarErroAuth(
        'api/login-failed',
        'Não foi possível conectar ao JSONBin.io. Verifique sua chave e o ID do bin.'
      );
    }
  }

  // Encerrar sessão do usuário atual
  async logout(): Promise<void> {
    this.definirUsuarioAtual(null);
  }
}

export const userService = new UserService();
