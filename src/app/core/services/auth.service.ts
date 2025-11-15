import { Injectable } from '@angular/core';
import {signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, User,setPersistence,
  browserLocalPersistence ,updateProfile,sendEmailVerification } from 'firebase/auth';
import { Router } from '@angular/router';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import {auth, db } from '../firebase.config';
import { BehaviorSubject } from 'rxjs';
import { Usuario } from 'src/app/models/usuario.model';


@Injectable({
  providedIn: 'root'
})


export class AuthService {

  //Usuario en Auth
  public usuarioAuth$=new BehaviorSubject<User|null>(null);

  //Usuario completo de firestore
  public usuarioApp$= new BehaviorSubject<Usuario|null>(null);



  constructor(private router: Router) {
    onAuthStateChanged(auth,async (user) => {
      this.usuarioAuth$.next(user);
      if (user) {
        const userRef=doc(db,'usuarios',user.uid);
        const snap=await getDoc(userRef);

        if(snap.exists()){
          this.usuarioApp$.next(snap.data() as Usuario);
        }else{
          this.usuarioApp$.next(null);
        }
      }else{
         this.usuarioApp$.next(null);
      }
    });
  }

  ///////////GETTERS///////////
  getUsuarioAuth(){
    return this.usuarioAuth$.asObservable();
  }

  getUsuarioApp(){
    return this.usuarioApp$.asObservable();
  }

  //Sincronizar usuario a firestore
private async syncUserToFirestore(user: User, nombreFromRegister?: string) {
  const userRef = doc(db, 'usuarios', user.uid);
  await setDoc(userRef, {
    nombre: nombreFromRegister || user.displayName || 'Sin nombre',
    email: user.email || '',
    foto: user.photoURL || '',
    lastLogin: Date.now()
  }, { merge: true });
}


//Iniciar sesión
  async login(email: string, password: string) {
    await setPersistence(auth,browserLocalPersistence);
    const cred = await signInWithEmailAndPassword(auth, email, password);
    await this.syncUserToFirestore(cred.user);
    return cred;
  }

async register(email: string, password: string, nombre: string) {
  if (!this.isEmailValid(email)) {
    return Promise.reject('Correo electrónico inválido');
  }
  if (!this.isPasswordSecure(password)) {
    return Promise.reject('La contraseña debe tener mínimo 7 caracteres, con letras y números');
  }

  const cred = await createUserWithEmailAndPassword(auth, email, password);

  // Actualiza nombre
  if (cred.user) {
    try {
       await updateProfile(cred.user, { displayName: nombre }).catch(console.error);
    } catch (error) {
        console.error('Error actualizando displayName en firebaseAuth',error);
    }

    try {
      await sendEmailVerification(cred.user); 
    } catch (error) {
      console.error('Error enviando email de verificación',error);
    }
    
  }

  await this.syncUserToFirestore(cred.user, nombre);
  return cred;
}

  logout() {
    return signOut(auth).then(() => {
      this.router.navigate(['/login']);
    });
  }

  isLoggedIn(): boolean {
    return !!this.usuarioAuth$.value;
  }


  isEmailValid(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  isPasswordSecure(password: string): boolean {
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{7,}$/;
    return passwordRegex.test(password);
  }

}
