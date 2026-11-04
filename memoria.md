# Memória do Projeto — goMusic

> [!IMPORTANT]
> **LEMBRETE — FAZER DEPOIS (PENDENTE):**
> **"os bins são separados, o da playlists é um bin e dos usuarios é outra bin arrume isso."**
>
> Quando for retomar:
> - Manter `USERS_BIN_ID` (`6aea86edac6210605a6a600c`) apenas para os dados dos usuários (`id`, `nome`, `celular`, `email`, `senha`, `createdAt`), sem aninhar `playlists` dentro do usuário.
> - Criar uma nova constante `PLAYLISTS_BIN_ID` em `src/constants/config.tsx` apontando para um Bin exclusivo de playlists no JSONBin.io.
> - Atualizar `src/screen/services/playlistService.tsx` para ler (`GET`) e gravar (`PUT`) diretamente no Bin de playlists, filtrando as playlists do usuário logado pelo campo `usuarioId`.

---

## 1. Visão Geral do Projeto

O **goMusic** é um aplicativo mobile/web de música desenvolvido com **Expo SDK 54**, **React Native 0.81.5**, **React 19.1** e **TypeScript**, utilizando **React Navigation (`native-stack`)** para navegação entre telas e **Axios + JSONBin.io (API v3)** para persistência de dados em nuvem.

### Telas do Aplicativo (`App.tsx`)
- **`Splash` (`src/screen/splash_screen.tsx`):** Tela inicial animada com efeito neon pulsante e redirecionamento automático para o Login.
- **`Login` (`src/screen/login_screen.tsx`):** Autenticação de usuários por e-mail e senha consultando o JSONBin.io.
- **`Register` (`src/screen/register_screen.tsx`):** Cadastro de novos usuários com máscara de celular, validação de senha forte e verificação de e-mail duplicado no JSONBin.io.
- **`Home` (`src/screen/home_screen.tsx`):** Tela principal com músicas recomendadas, carrossel das playlists do usuário logado, mini player flutuante e modal promocional goMusic Premium.
- **`Search` (`src/screen/search_screen.tsx`):** Tela de busca de músicas, artistas e podcasts.
- **`Playlist` (`src/screen/playlist_screen.tsx`):** CRUD completo de playlists vinculadas ao usuário autenticado (listagem, criação, edição e exclusão com validação de campos e data).
- **`Api` (`src/screen/api_screen.tsx`):** Catálogo completo de músicas integrado ao JSONBin.io (busca em tempo real, pull-to-refresh, cadastro, edição e exclusão de faixas).

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

### 2.2. Migração Completa do Firebase para o JSONBin.io
- **Remoção total do Firebase:** Desinstalado o pacote `firebase` do `package.json` e removido `src/screen/services/firebaseConfig.tsx`.
- **Configuração de Bins (`src/constants/config.tsx`):**
  - `BIN_ID`: `'6ae146cbffd5d16053917681'` (Catálogo de Músicas).
  - `USERS_BIN_ID`: `'6aea86edac6210605a6a600c'` (Usuários — *atualmente compartilhando playlists até realizar a separação descrita no lembrete acima*).
  - Helpers `obterIdBinUsuarios()`, `binUsuariosConfigurado()` e `obterUrlsUsuarios()`.
- **Serviço de Usuários e Sessão (`src/screen/services/userService.tsx`):**
  - Implementados `cadastrarUsuario`, `login`, `logout`, `obterUsuarioAtual` e `onAuthChange` consumindo a API v3 do JSONBin.io via Axios (com persistência de sessão no `localStorage` quando executado na Web).
- **Serviço e Contexto de Playlists (`src/screen/services/playlistService.tsx` e `src/context/PlaylistContext.tsx`):**
  - Adaptados para sincronizar as playlists com o usuário autenticado via `userService.onAuthChange` e persistir no JSONBin.io (*pendente separar em um Bin próprio conforme lembrete*).
- **Integração nas Telas e Serviços:**
  - `LoginScreen`, `RegisterScreen`, `HomeScreen`, `SearchScreen`, `PlaylistScreen`, `ApiScreen` e `src/services/api.tsx` atualizados para utilizar `userService` em vez do Firebase Auth.

---

## 3. Verificações Realizadas
- `npx tsc --noEmit`: **0 erros**
- `npm run lint`: **0 erros e 0 avisos**
- `npx expo-doctor`: **18/18 verificações aprovadas**
