import { Injectable } from '@angular/core';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from '../firebase.config';
import { ToastController } from '@ionic/angular';
@Injectable({
  providedIn: 'root'
})
export class StorageService {


  private tiposPermitidos = ['image/jpeg', 'image/png', 'image/webp'];
  private tamañoMaximoMB = 5;

  constructor(private toastController: ToastController) {}

  async subirArchivo(ruta: string, archivo: File): Promise<string | null> {
    // Validar tipo
    if (!this.tiposPermitidos.includes(archivo.type)) {
      this.mostrarToast('Formato no permitido. Usa JPG, PNG o WEBP.', 'danger');
      return null;
    }

    // Validar tamaño
    const tamañoMB = archivo.size / (1024 * 1024);
    if (tamañoMB > this.tamañoMaximoMB) {
      this.mostrarToast(`El archivo supera los ${this.tamañoMaximoMB} MB.`, 'danger');
      return null;
    }

    try {
      const storageRef = ref(storage, ruta);
      const snapshot = await uploadBytes(storageRef, archivo);
      const url = await getDownloadURL(snapshot.ref);
      this.mostrarToast('Imagen subida con éxito.', 'success');
      return url;
    } catch (error) {
      console.error('Error subiendo imagen:', error);
      this.mostrarToast('Error al subir imagen.', 'danger');
      return null;
    }
  }

  private async mostrarToast(mensaje: string, color: 'success' | 'danger') {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2500,
      color,
      position: 'top'
    });
    await toast.present();
  }
}
