import { Injectable } from '@angular/core';
import { collection, doc, getDoc, getDocs, onSnapshot, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase.config';

@Injectable({
  providedIn: 'root'
})
export class VotacionService {

  async obtenerPlan(planId: string) {
    const docRef = doc(db, `planesColaborativos/${planId}`);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : null;
  }

  async obtenerVotos(planId: string, fechasPropuestas: string[]) {
    const votosRef = collection(db, `votos/${planId}/usuarios`);
    const votosSnap = await getDocs(votosRef);

    const conteoFechas: { [fecha: string]: number } = {};
    fechasPropuestas.forEach(fecha => conteoFechas[fecha] = 0);

    votosSnap.forEach((doc) => {
      const data = doc.data();
      if (Array.isArray(data['fechas'])) {
        data['fechas'].forEach((fecha: string) => {
          if (conteoFechas[fecha] !== undefined) {
            conteoFechas[fecha]++;
          }
        });
      }
    });

    return conteoFechas;
  }

  escucharVotosTiempoReal(planId: string, fechasPropuestas: string[], callback: (conteo: { [fecha: string]: number }) => void) {
    const votosRef = collection(db, `votos/${planId}/usuarios`);
    return onSnapshot(votosRef, (snapshot) => {
      const conteoFechas: { [fecha: string]: number } = {};
      fechasPropuestas.forEach(fecha => conteoFechas[fecha] = 0);

      snapshot.forEach((doc) => {
        const data = doc.data();
        if (Array.isArray(data['fechas'])) {
          data['fechas'].forEach((fecha: string) => {
            if (conteoFechas[fecha] !== undefined) {
              conteoFechas[fecha]++;
            }
          });
        }
      });

      callback(conteoFechas);
    });
  }

  async enviarVoto(planId: string, fechasSeleccionadas: string[]) {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuario no autenticado');

    const voto = {
      fechas: fechasSeleccionadas,
      timestamp: new Date()
    };

    const votoRef = doc(db, `votos/${planId}/usuarios/${user.uid}`);
    await setDoc(votoRef, voto);
  }

  async guardarFechaFinalElegida(planId: string, fechaFinal: string) {
  const planRef = doc(db, `planesColaborativos/${planId}`);
  await setDoc(planRef, { fechaFinalElegida: fechaFinal }, { merge: true });
}


  async cerrarVotacion(planId: string) {
    const planRef = doc(db, `planesColaborativos/${planId}`);
    await setDoc(planRef, { votacionEstado: 'cerrada' }, { merge: true });
  }
}
