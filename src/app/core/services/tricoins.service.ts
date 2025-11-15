import { Injectable } from '@angular/core';
import { addDoc, collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';
import { db } from '../firebase.config';
import { UserService } from './user.service';

export interface TricoinPago {
  id?: string;
  grupoId: string;
  descripcion: string;
  cantidad: number;
  pagadoPor: string;
  involucrados: string[];
  timestamp: number;
}
@Injectable({
  providedIn: 'root'
})
export class TricoinsService {
  constructor(private userService: UserService) {}

  async agregarPago(grupoId: string, pago: Omit<TricoinPago, 'timestamp'>): Promise<void> {
    const colRef = collection(db, 'grupos', grupoId, 'tricoins');
    await addDoc(colRef, { ...pago, timestamp: Date.now() });
  }

  async obtenerPagos(grupoId: string): Promise<TricoinPago[]> {
    const colRef = collection(db, 'grupos', grupoId, 'tricoins');
    const snapshot = await getDocs(colRef);
    return snapshot.docs
      .filter(docSnap => docSnap.id !== 'activo')
      .map(docSnap => ({ id: docSnap.id, ...(docSnap.data() as TricoinPago) }));
  }

  async calcularBalances(grupoId: string): Promise<{ [userId: string]: number }> {
    const pagos = await this.obtenerPagos(grupoId);
    const balances: { [userId: string]: number } = {};

    for (const pago of pagos) {
      const porPersona = pago.cantidad / pago.involucrados.length;

      for (const user of pago.involucrados) {
        balances[user] = (balances[user] || 0) - porPersona;
      }

      balances[pago.pagadoPor] = (balances[pago.pagadoPor] || 0) + pago.cantidad;
    }

    return balances;
  }

  async calcularDeudas(grupoId: string): Promise<{ deudor: string, acreedor: string, cantidad: number }[]> {
    const balances = await this.calcularBalances(grupoId);

    const acreedores = Object.entries(balances)
      .filter(([_, balance]) => balance > 0)
      .map(([user, balance]) => ({ user, balance }));

    const deudores = Object.entries(balances)
      .filter(([_, balance]) => balance < 0)
      .map(([user, balance]) => ({ user, balance: -balance }));

    const deudas: { deudor: string, acreedor: string, cantidad: number }[] = [];

    for (const deudor of deudores) {
      for (const acreedor of acreedores) {
        const cantidad = Math.min(deudor.balance, acreedor.balance);
        if (cantidad > 0) {
          deudas.push({
            deudor: deudor.user,
            acreedor: acreedor.user,
            cantidad: parseFloat(cantidad.toFixed(2))
          });

          deudor.balance -= cantidad;
          acreedor.balance -= cantidad;
        }
      }
    }

    return deudas;
  }

  async calcularPagosYDeudasPorUsuario(grupoId: string): Promise<{ uid: string, pagado: number, debe: number }[]> {
    const pagos = await this.obtenerPagos(grupoId);
    const resumen: { [uid: string]: { pagado: number, debe: number } } = {};

    for (const pago of pagos) {
      resumen[pago.pagadoPor] = resumen[pago.pagadoPor] || { pagado: 0, debe: 0 };
      resumen[pago.pagadoPor].pagado += pago.cantidad;

      const cantidadPorInvolucrado = pago.cantidad / pago.involucrados.length;
      for (const uid of pago.involucrados) {
        if (uid !== pago.pagadoPor) {
          resumen[uid] = resumen[uid] || { pagado: 0, debe: 0 };
          resumen[uid].debe += cantidadPorInvolucrado;
        }
      }
    }

    return Object.entries(resumen).map(([uid, valores]) => ({
      uid,
      pagado: parseFloat(valores.pagado.toFixed(2)),
      debe: parseFloat(valores.debe.toFixed(2)),
    }));
  }

  async cargarDatosTricoins(grupoId: string): Promise<{ tricoinsData: { nombre: string } | null, miembros: { uid: string, nombre: string }[] }> {
    const tricoinsDocRef = doc(db, 'grupos', grupoId, 'tricoins', 'activo');
    const tricoinsSnap = await getDoc(tricoinsDocRef);

    if (!tricoinsSnap.exists()) return { tricoinsData: null, miembros: [] };

    const tricoinsActivo = tricoinsSnap.data();
    const miembrosUids: string[] = tricoinsActivo['miembros'] || [];
    const miembrosFicticios: Record<string, string> = tricoinsActivo['miembrosFicticios'] || {};

    const miembrosFinales: { uid: string; nombre: string }[] = await Promise.all(
      miembrosUids.map(async (uid) => {
        if (uid.startsWith('fict_')) {
          return { uid, nombre: miembrosFicticios[uid] || 'Miembro ficticio' };
        } else {
          try {
            const userData = await this.userService.getUserById(uid);
            return {
              uid,
              nombre: userData?.nombre || userData?.displayName || uid,
            };
          } catch {
            return { uid, nombre: 'Error al cargar' };
          }
        }
      })
    );

    return { tricoinsData: { nombre: tricoinsActivo['nombre'] || 'Sin nombre' }, miembros: miembrosFinales };
  }

  async anadirMiembroFicticio(grupoId: string, nombre: string): Promise<void> {
    const tricoinsDocRef = doc(db, 'grupos', grupoId, 'tricoins', 'activo');
    const tricoinsSnap = await getDoc(tricoinsDocRef);
    if (!tricoinsSnap.exists()) throw new Error('Tricoins no inicializado');

    const data = tricoinsSnap.data();
    const miembros: string[] = data['miembros'] || [];
    const miembrosFicticios: { [key: string]: string } = data['miembrosFicticios'] || {};

    const nuevoUid = 'fict_' + Date.now();
    miembros.push(nuevoUid);
    miembrosFicticios[nuevoUid] = nombre;

    await setDoc(tricoinsDocRef, { ...data, miembros, miembrosFicticios });
  }

  async anadirMiembroReal(grupoId: string, uidSeleccionado: string): Promise<void> {
    const tricoinsDocRef = doc(db, 'grupos', grupoId, 'tricoins', 'activo');
    const tricoinsSnap = await getDoc(tricoinsDocRef);
    if (!tricoinsSnap.exists()) throw new Error('Tricoins no inicializado');

    const data = tricoinsSnap.data();
    const actuales: string[] = data['miembros'] || [];

    if (!actuales.includes(uidSeleccionado)) {
      const nuevosMiembros = [...actuales, uidSeleccionado];
      await setDoc(tricoinsDocRef, { ...data, miembros: nuevosMiembros });
    }
  }

}
