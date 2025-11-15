import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import {db,auth} from '../../core/firebase.config'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

import { GrupoService } from 'src/app/core/services/grupo.service';
import { ToastController } from '@ionic/angular';
import { StorageService } from 'src/app/core/services/storage.service';
import { Grupo } from 'src/app/models/grupo.model';

@Component({
  selector: 'app-create-join',
  templateUrl: './create-join.page.html',
  styleUrls: ['./create-join.page.scss'],
  standalone:false
})
export class CreateJoinPage implements OnInit {

  nombre = '';
  descripcion = '';
  errorMsg = '';
  fotoFile: File | null = null;
  fotoPreview: string | null = null;

  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef;

  constructor(
    private router: Router,
    private grupoService: GrupoService,
    private toastController: ToastController,
    private storageService: StorageService
  ) {}

  ngOnInit() {}

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    // Validación básica de imagen y preview
    const tiposPermitidos = ['image/jpeg', 'image/png', 'image/webp'];
    const tamañoMB = file.size / (1024 * 1024);

    if (!tiposPermitidos.includes(file.type)) {
      this.mostrarToast('Formato no permitido (usa JPG, PNG o WEBP)', 'danger');
      return;
    }

    if (tamañoMB > 5) {
      this.mostrarToast('El archivo supera los 5 MB', 'danger');
      return;
    }

    this.fotoFile = file;

    const reader = new FileReader();
    reader.onload = () => {
      this.fotoPreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  async crearGrupo() {
    const user = auth.currentUser;
    if (!user) {
      this.errorMsg = "Usuario no autenticado";
      return;
    }

    const shareCode = this.grupoService.generateShareCode();
    let fotoUrl = '';

    try {
      // Si hay imagen, subirla
      if (this.fotoFile) {
        const ruta = `grupos/${shareCode}/foto.jpg`;
        const subida = await this.storageService.subirArchivo(ruta, this.fotoFile);
        if (subida) {
          fotoUrl = subida;
        }
      }
     
    // Construir un grupo tipado
    const nuevoGrupo: Grupo = {
      nombre: this.nombre,
      descripcion:this.descripcion,
      foto: fotoUrl,
      creadorId: user.uid,
      miembros: [user.uid],
      shareCode: shareCode,
      timestamp: serverTimestamp(),
      votacionEstado: 'abierta',
    };

    await addDoc(collection(db, 'grupos'), nuevoGrupo);

      // Reset
      this.nombre = '';
      this.descripcion = '';
      this.fotoFile = null;
      this.fotoPreview = null;

      await this.grupoService.refreshGrupos();
      this.mostrarToast('¡Grupo creado con éxito!', 'success');
    } catch (error: any) {
      console.error(error);
      this.errorMsg = error.message;
      this.mostrarToast('Error al crear el grupo', 'danger');
    }
  }

  async mostrarToast(mensaje: string, color: 'success' | 'danger') {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2500,
      color,
      position: 'top'
    });
    await toast.present();
  }

}
