import { Injectable } from '@angular/core';
import { auth, db, storage } from '../firebase.config';
import { deleteObject, getDownloadURL, listAll, ref, uploadBytes } from 'firebase/storage';
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, updateDoc } from 'firebase/firestore';
import { BehaviorSubject } from 'rxjs';
import { ToastController } from '@ionic/angular';
import { deleteObject as deleteFromStorage } from 'firebase/storage';
@Injectable({
  providedIn: 'root'
})
export class GaleriaService {


constructor(private toastController:ToastController){}



  async subirFoto(grupoId: string, archivo: File): Promise<void> {
    const userId = auth.currentUser?.uid;
    if (!userId || !grupoId || !archivo) return;

    const userDocRef = doc(db, 'usuarios', userId); // Asegúrate de tener esta colección
    const userSnap = await getDoc(userDocRef);
    const nombreUsuario = userSnap.exists() ? userSnap.data()['nombre'] || 'Usuario desconocido' : 'Usuario desconocido';

    const timestamp = Date.now();
    const nombreArchivo = `${timestamp}_${archivo.name}`;
    const rutaStorage = `galeria/${grupoId}/${nombreArchivo}`;
    const storageRef = ref(storage, rutaStorage);

    await uploadBytes(storageRef, archivo);
    const url = await getDownloadURL(storageRef);

    const galeriaRef = collection(db, 'grupos', grupoId, 'galeria');
    await addDoc(galeriaRef, {
      url,
      uidUsuario: userId,
      nombreUsuario,
      fechaSubida: new Date(),
      ciudad: null
    });
  }

  async eliminarFotoDeAlbum(grupoId: string, albumId: string, fotoId: string, fotoUrl: string): Promise<void> {
  try {
    // Eliminar de Storage
    const decodedUrl = decodeURIComponent(fotoUrl.split('?')[0]);
    const path = decodedUrl.split('/o/')[1]; 
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);

    // Eliminar de Firestore
    await deleteDoc(doc(db, `grupos/${grupoId}/galeria/${albumId}/fotos/${fotoId}`));
  } catch (error) {
    console.error('Error eliminando la foto:', error);
    throw error;
  }
}

  async obtenerFotosGrupo(grupoId: string): Promise<any[]> {
    if (!grupoId) throw new Error('grupoId no puede estar vacío');
    const galeriaRef = collection(db, 'grupos', grupoId, 'galeria');
    const q = query(galeriaRef, orderBy('fechaSubida', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  /*ALBUMES*/

  private albumIdSource = new BehaviorSubject<string | null>(null);
  albumId$ = this.albumIdSource.asObservable();

  setAlbumId(id: string) {
    this.albumIdSource.next(id);
  }

  getAlbumId(): string | null {
    return this.albumIdSource.getValue();
  }

  async obtenerFotosDeAlbum(grupoId: string, albumId: string): Promise<any[]> {
    const fotosRef = collection(db, 'grupos', grupoId, 'galeria', albumId, 'fotos');
    const q = query(fotosRef, orderBy('fechaSubida', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async crearAlbum(grupoId: string, nombre: string): Promise<void> {
    if (!grupoId || !nombre) return;

    const albumesRef = collection(db, 'grupos', grupoId, 'galeria');
    await addDoc(albumesRef, {
      nombre,
      creadoPor: auth.currentUser?.uid,
      creadoEn: new Date()
    });
  }

  async obtenerAlbums(grupoId: string): Promise<any[]> {
    const galeriaRef = collection(db, 'grupos', grupoId, 'galeria');
    const q = query(galeriaRef, orderBy('creadoEn', 'desc'));
    const snapshot = await getDocs(q);
console.log('Docs obtenidos en obtenerAlbums:', snapshot.docs.map(d => d.id));
    const albums = await Promise.all(
      snapshot.docs.map(async (doc) => {
        // Clonamos y extendemos el objeto, para evitar error TS
        const album = { id: doc.id, ...(doc.data() as any) };

        // Fotos dentro del álbum
        const fotosRef = collection(db, 'grupos', grupoId, 'galeria', doc.id, 'fotos');
        const fotosSnap = await getDocs(fotosRef);

        album.totalFotos = fotosSnap.size;

        if (album.totalFotos > 0) {
          const ultimaFotoQuery = query(fotosRef, orderBy('fechaSubida', 'desc'));
          const ultimaFotoSnap = await getDocs(ultimaFotoQuery);
          const ultimaFoto = ultimaFotoSnap.docs[0]?.data();
          album.ultimaFotoUrl = ultimaFoto?.['url'] || null;
        } else {
          album.ultimaFotoUrl = null;
        }

        return album;
      })
    );


    return albums;
  }


  async subirFotoEnAlbum(grupoId: string, albumId: string, archivo: File): Promise<void> {
    const userId = auth.currentUser?.uid;
    if (!userId || !grupoId || !albumId || !archivo) return;

    const timestamp = Date.now();
    const nombreArchivo = `${timestamp}_${archivo.name}`;
    const rutaStorage = `galeria/${grupoId}/${albumId}/${nombreArchivo}`;  // Carpeta del álbum
    const storageRef = ref(storage, rutaStorage);

    await uploadBytes(storageRef, archivo);
    const url = await getDownloadURL(storageRef);

    const albumGaleriaRef = collection(db, 'grupos', grupoId, 'galeria', albumId, 'fotos'); // Fotos dentro del álbum
    await addDoc(albumGaleriaRef, {
      url,
      uidUsuario: userId,
      fechaSubida: new Date(),
      ciudad: null
    });
  }

  async eliminarAlbum(grupoId: string, albumId: string): Promise<void> {
    if (!grupoId || !albumId) {
      console.error('grupoId o albumId inválidos');
      throw new Error('grupoId o albumId inválidos');
    }

    const albumPath = `galeria/${grupoId}/${albumId}`;
    const storageRef = ref(storage, albumPath);

    try {
      console.log(`Iniciando eliminación del álbum: grupo=${grupoId}, álbum=${albumId}`);

      // Listar archivos en Storage
      const result = await listAll(storageRef);

      for (const itemRef of result.items) {
        await deleteObject(itemRef);
      }

      // Listar documentos fotos en Firestore
      const fotosPath = `grupos/${grupoId}/galeria/${albumId}/fotos`;
      const fotosSnap = await getDocs(collection(db, fotosPath));

      for (const fotoDoc of fotosSnap.docs) {
        await deleteDoc(fotoDoc.ref);
      }

      // Eliminar documento álbum
      const albumDocPath = `grupos/${grupoId}/galeria/${albumId}`;
      await deleteDoc(doc(db, `grupos/${grupoId}/galeria`, albumId));


    } catch (error) {
      console.error('Error al eliminar el álbum completo:', error);
      throw error;
    }
  }





  async editarNombreAlbum(grupoId: string, albumId: string, nuevoNombre: string): Promise<void> {
    const albumRef = doc(db, 'grupos', grupoId, 'galeria', albumId);
    await updateDoc(albumRef, { nombre: nuevoNombre });
  }


    async mostrarToast(mensaje: string, color: string = 'success', duracion: number = 2000) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: duracion,
      color,
      position: 'bottom'
    });
    await toast.present();
  }

}
