import {
    createUserWithEmailAndPassword,
} from 'firebase/auth';
 
import {
    ref,
    set,
} from 'firebase/database';
 
import {
    auth,
    database,
} from './firebaseConfig';
 
import {
    UserModel,
} from '../models/UserModel';
//cadastrar no database do firebase
class UserService {
    async cadastrarUsuario(
        nome: string,
        celular: string,
        email: string,
        senha: string
    ): Promise<UserModel> {
 
        const userCredential =
            await createUserWithEmailAndPassword(
                auth,
                email,
                senha
            );
        //gera o id
        const uid =
            userCredential.user.uid;
 
        const usuario: UserModel = {
            id: uid,
            nome: nome,
            celular: celular,
            email: email,
            createdAt: new Date().toISOString(),
        };
 
        await set(
            ref(database, `usuarios/${uid}`),
            usuario
        );
 
        return usuario;
    }
}
 
export const userService = new UserService();