import { Injectable } from '@angular/core';
import { addDoc, arrayRemove, arrayUnion, collection, doc, onSnapshot, query, updateDoc } from 'firebase/firestore';
import { PropuestaFecha } from 'src/app/models/propuesta-fecha.model';
import { db } from '../firebase.config';

@Injectable({
  providedIn: 'root'
})
export class FechasService {

 constructor() {}

  async proponerFecha(grupoId: string, propuesta: PropuestaFecha) {
    const colRef = collection(db, 'grupos', grupoId, 'fechas');
     const { id, ...resto } = propuesta; // Evitar subir el `id` si existe
  return await addDoc(colRef, {
    ...resto,
    votos: []
  });
  }

  escucharPropuestas(grupoId: string, callback: (fechas: PropuestaFecha[]) => void) {
    const colRef = collection(db, 'grupos', grupoId, 'fechas');
    return onSnapshot(query(colRef), snapshot => {
      const datos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as PropuestaFecha[];
      callback(datos);
    });
  }

  votarFecha(grupoId: string, fechaId: string, userId: string) {
    const docRef = doc(db, 'grupos', grupoId, 'fechas', fechaId);
    return updateDoc(docRef, {
      votos: arrayUnion(userId)
    });
  }

  
desvotarFecha(grupoId: string, fechaId: string, userId: string) {
  const docRef = doc(db, 'grupos', grupoId, 'fechas', fechaId);
  return updateDoc(docRef, {
    votos: arrayRemove(userId)
  });
}
}
