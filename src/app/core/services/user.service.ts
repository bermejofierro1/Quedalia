import { Injectable } from '@angular/core';
import { updateProfile, User } from 'firebase/auth';
import { auth, db } from '../firebase.config';
import { arrayRemove, arrayUnion, collection, doc, getDoc, getDocs, query, updateDoc, where } from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor() { }

   getUsuarioActual(): User | null {
    return auth.currentUser;
  }

  actualizarNombre(nombre: string): Promise<void> {
    const user = auth.currentUser;
    if (user) {
      return updateProfile(user, { displayName: nombre });
    } else {
      return Promise.reject('Usuario no autenticado');
    }
  }

  async getUserById(uid: string): Promise<any> {
    try {
      const userDocRef = doc(db, 'usuarios', uid);  
      const userSnap = await getDoc(userDocRef);
      if (userSnap.exists()) {
        return userSnap.data();
      } else {
        console.warn('Usuario no encontrado:', uid);
        return null;
      }
    } catch (error) {
      console.error('Error obteniendo usuario:', error);
      return null;
    }
  }

  async getNombreUserById(uid: string): Promise<string> {
  try {
    const userDocRef = doc(db, 'usuarios', uid);
    const userSnap = await getDoc(userDocRef);
    if (userSnap.exists()) {
      const data = userSnap.data();
      return data['nombre'] || 'Sin nombre';
    } else {
      return 'Usuario no encontrado';
    }
  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    return 'Error';
  }
}

 async getGruposDelUsuario(): Promise<any[]> {
  const userId = auth.currentUser?.uid;
  console.log('UserService.getGruposDelUsuario - userId:', userId);
  if (!userId) {
    console.warn('UserService.getGruposDelUsuario - No hay usuario autenticado');
    return [];
  }

  const gruposRef = collection(db, 'grupos');
  const q = query(gruposRef, where('miembros', 'array-contains', userId));
  const snapshot = await getDocs(q);

  console.log(`UserService.getGruposDelUsuario - Encontrados ${snapshot.size} grupos`);

  const grupos = snapshot.docs.map(doc => {
    const data = doc.data();
    console.log('Grupo:', doc.id, data);
    return { id: doc.id, ...data };
  });

  return grupos;
}


async getPlanesDelUsuario(): Promise<any[]> {
  const userId = auth.currentUser?.uid;
  console.log('UserService.getPlanesDelUsuario - userId:', userId);
  if (!userId) {
    console.warn('UserService.getPlanesDelUsuario - No hay usuario autenticado');
    return [];
  }

  const planesRef = collection(db, 'planesColaborativos');

  // Planes donde es colaborador
  const qColaboradores = query(planesRef, where('colaboradores', 'array-contains', userId));
  const snapColaboradores = await getDocs(qColaboradores);
  console.log(`UserService.getPlanesDelUsuario - Planes como colaborador: ${snapColaboradores.size}`);

  snapColaboradores.forEach(doc => {
    console.log('Plan colaborador:', doc.id, doc.data());
  });

  // Planes donde es miembro externo
  const qExternos = query(planesRef, where('miembrosExternos', 'array-contains', userId));
  const snapExternos = await getDocs(qExternos);
  console.log(`UserService.getPlanesDelUsuario - Planes como miembro externo: ${snapExternos.size}`);

  snapExternos.forEach(doc => {
    console.log('Plan miembro externo:', doc.id, doc.data());
  });

  const mapas = new Map<string, any>();

  snapColaboradores.forEach(doc => {
    mapas.set(doc.id, { id: doc.id, ...doc.data() });
  });

  snapExternos.forEach(doc => {
    if (!mapas.has(doc.id)) {
      mapas.set(doc.id, { id: doc.id, ...doc.data() });
    }
  });

  const planes = Array.from(mapas.values());
  console.log('UserService.getPlanesDelUsuario - Total planes unidos:', planes.length);

  return planes;
}


//=======AGREGAR A FAVORITOS=======//

async esFavoritoPlan(uid:string,planId:string):Promise<boolean>{
  try {
    const userRef=doc(db,'usuarios',uid);
    const userSnap= await getDoc(userRef);
    const data=userSnap.data();
    const favoritos=data?.['favoritos']?.planes|| [];
    return favoritos.includes(planId);
  } catch (error) {
    console.error('Error comprobando favoritos',error);
    return false;
  }
}

async toggleFavoritoPlan(uid: string, planId: string): Promise<boolean> {
  try {
    const userRef = doc(db, 'usuarios', uid);
    const userSnap = await getDoc(userRef);
    const data = userSnap.data();
    const favoritos = data?.['favoritos']?.planes || [];

    const yaEsFavorito = favoritos.includes(planId);

    if (yaEsFavorito) {
      await updateDoc(userRef, {
        'favoritos.planes': arrayRemove(planId)
      });
    } else {
      await updateDoc(userRef, {
        'favoritos.planes': arrayUnion(planId)
      });
      
    }

    return !yaEsFavorito; // Devuelve el nuevo estado
  } catch (error) {
    console.error('Error actualizando favorito:', error);
    return false;
  }
}

async getPlanesFavoritos():Promise<any[]>{

 const uid = auth.currentUser?.uid;
  if (!uid) return [];

  try {
    const userSnap = await getDoc(doc(db, 'usuarios', uid));
    const data = userSnap.data();
    const idsFavoritos: string[] = data?.['favoritos']?.planes || [];

    const planesRef = collection(db, 'planesColaborativos');

    const planes = await Promise.all(
      idsFavoritos.map(async id => {
        const planDoc = await getDoc(doc(planesRef, id));
        return planDoc.exists() ? { id: planDoc.id, ...planDoc.data() } : null;
      })
    );

    return planes.filter(plan => plan !== null);
  } catch (error) {
    console.error('Error obteniendo planes favoritos:', error);
    return [];
  }



}
  
}
