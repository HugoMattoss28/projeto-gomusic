# Memória do Projeto — goMusic

> [!NOTE]
> **LEMBRETE RESOLVIDO:**
> A separação dos Bins no JSONBin.io foi concluída! Agora o projeto utiliza **3 Bins independentes**:
> 1. **Músicas (`BIN_ID`):** `6ae146cbffd5d16053917681`
> 2. **Usuários (`USERS_BIN_ID`):** `6aea86edac6210605a6a600c` (apenas dados de conta dos usuários)
> 3. **Playlists (`PLAYLISTS_BIN_ID`):** `6af264d6ac6210605a7b69a3` (apenas playlists, vinculadas ao usuário pelo campo `usuarioId`)

---

## 1. Visão Geral do Projeto

O **goMusic** é um aplicativo mobile/web de música desenvolvido com **Expo SDK 54**, **React Native 0.81.5**, **React 19.1** e **TypeScript**, utilizando **React Navigation (`native-stack`)** para navegação entre telas e **Axios + JSONBin.io (API v3)** para persistência de dados em nuvem.

### Telas do Aplicativo (`App.tsx`)
- **`Splash` (`src/screen/splash_screen.tsx`):** Tela inicial animada com efeito neon pulsante e redirecionamento automático para o Login.
- **`Login` (`src/screen/login_screen.tsx`):** Autenticação de usuários por e-mail e senha consultando o Bin de Usuários (`USERS_BIN_ID`) no JSONBin.io.
- **`Register` (`src/screen/register_screen.tsx`):** Cadastro de novos usuários com máscara de celular, validação de senha forte e verificação de e-mail duplicado no Bin de Usuários (`USERS_BIN_ID`).
- **`Home` (`src/screen/home_screen.tsx`):** Tela principal com músicas recomendadas, carrossel das playlists do usuário logado, mini player flutuante e modal promocional goMusic Premium.
- **`Search` (`src/screen/search_screen.tsx`):** Tela de pesquisa com listagem imediata das playlists do usuário e músicas do catálogo ao abrir (mesmo com o campo vazio) e filtragem dinâmica em tempo real conforme o usuário digita, com filtros por categoria (`Tudo`, `Playlists` e `Músicas`).
- **`Playlist` (`src/screen/playlist_screen.tsx`):** CRUD completo de playlists vinculadas ao usuário autenticado no Bin de Playlists (`PLAYLISTS_BIN_ID`).
- **`Api` (`src/screen/api_screen.tsx`):** Catálogo completo de músicas integrado ao Bin de Músicas (`BIN_ID`) no JSONBin.io.

---

## 2. O que foi feito no projeto

### 2.1. Correção de Erros de Compilação, Lint e Compatibilidade (Expo SDK 54)
- **Remoção de arquivos órfãos do `expo-router`:** Excluídos `app/_layout.tsx`, `app/modal.tsx` e `.expo/types/router.d.ts`, além do ajuste em `app.json` (remoção de `typedRoutes`) e `tsconfig.json`, eliminando todos os erros do TypeScript (`npx tsc --noEmit`) e do ESLint (`npm run lint`).
- **Adequação ao React Native 0.81 e Android Edge-to-Edge:**
  - Adicionado `SafeAreaProvider` em `App.tsx` e substituído o `SafeAreaView` depreciado do `react-native` pelo `SafeAreaView` de `react-native-safe-area-context` nas telas `Home`, `Search`, `Playlist` e `Api`.
  - Removidas propriedades `backgroundColor` incompatíveis com `edgeToEdgeEnabled: true` no `StatusBar`.
  - Ajustada a prop `resizeMode="contain"` nas imagens (`Splash`, `Login` e `Register`) e o `useNativeDriver` na Web.
  - Refatoradas as animações da `SplashScreen` com `useState` lazy e limpeza no `unmount` para total compatibilidade com o **React Compiler**.
- **Correções de Regras de Negócio e UI:**
  - Corrigida a ordem de limpeza do formulário em `PlaylistScreen` para exibir o aviso verde de sucesso antes de fechar o modal.
  - Aprimorada a validação `PlaylistService.validarData` para rejeitar datas inexistentes no calendário (ex.: `31/02/2026`).
  - Ajustado o controle de erro de imagem em `ApiScreen` (`id` + `imagem`) para recarregar capas atualizadas após edição.

### 2.2. Migração Completa do Firebase para o JSONBin.io (Bins Separados)
- **Remoção total do Firebase:** Desinstalado o pacote `firebase` do `package.json` e removido `src/screen/services/firebaseConfig.tsx`.
- **Configuração dos 3 Bins (`src/constants/config.tsx`):**
  - `BIN_ID`: `'6ae146cbffd5d16053917681'` (Catálogo de Músicas).
  - `USERS_BIN_ID`: `'6aea86edac6210605a6a600c'` (Usuários — armazena exclusivamente os objetos de usuário).
  - `PLAYLISTS_BIN_ID`: `'6af264d6ac6210605a7b69a3'` (Playlists — armazena exclusivamente as playlists, relacionadas ao dono por `usuarioId`).
- **Serviço de Usuários e Sessão (`src/screen/services/userService.tsx`):**
  - Implementados `cadastrarUsuario`, `login`, `logout`, `obterUsuarioAtual` e `onAuthChange` consumindo o Bin de Usuários (`USERS_BIN_ID`) via Axios.
- **Serviço e Contexto de Playlists (`src/screen/services/playlistService.tsx` e `src/context/PlaylistContext.tsx`):**
  - Implementado o CRUD completo (`listarTodas`, `criar`, `obterPorId`, `atualizar`, `eliminar`) lendo e gravando diretamente no Bin exclusivo de Playlists (`PLAYLISTS_BIN_ID`) e filtrando pelo `usuarioId` do usuário autenticado.
  - Memoizadas as funções do `PlaylistContext` com `useCallback` para evitar re-renderizações desnecessárias nas telas consumidoras.

### 2.3. Funcionalidade de Pesquisa em Tempo Real (`src/screen/search_screen.tsx`)
- Exibição imediata das **Playlists** (`PLAYLISTS_BIN_ID`) e **Músicas** (`BIN_ID`) assim que o usuário abre a tela de pesquisa (sem precisar digitar nada).
- Filtragem instantânea conforme o usuário digita (normalizando maiúsculas/minúsculas e acentos) por nome/descrição da playlist e por título/artista da música.
- Adicionados filtros rápidos (`Tudo`, `Playlists`, `Músicas`), botão de limpar busca e atualização com *pull-to-refresh*.

---

## 3. Verificações Realizadas
- `npx tsc --noEmit`: **0 erros**
- `npm run lint`: **0 erros e 0 avisos**
- `npx expo-doctor`: **18/18 verificações aprovadas**
