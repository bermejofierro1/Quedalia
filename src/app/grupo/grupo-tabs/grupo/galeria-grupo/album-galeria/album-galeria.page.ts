import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { GaleriaService } from 'src/app/core/services/galeria.service';
import { GrupoService } from 'src/app/core/services/grupo.service';
import { ModalImagenAmpliadaComponent } from 'src/app/shared/modal-imagen-ampliada/modal-imagen-ampliada.component';

@Component({
  selector: 'app-album-galeria',
  templateUrl: './album-galeria.page.html',
  styleUrls: ['./album-galeria.page.scss'],
  standalone: false
})
export class AlbumGaleriaPage implements OnInit {
  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef<HTMLInputElement>;

  grupoId = '';
  albumId = '';
  fotos: any[] = [];
  nombreAlbum = 'Álbum de Fotos';
  isLoading = false;
private longPressTimeout: any;
  constructor(
    private galeriaService: GaleriaService,
    private grupoService: GrupoService,
    private modalController: ModalController,
   private  alertController:AlertController
  ) { }

  ngOnInit() {
    this.albumId = this.galeriaService.getAlbumId() || '';
    if (!this.albumId) {
      console.error('Album ID no encontrado');
      return;
    }

    this.grupoService.getGrupoId().subscribe(grupoId => {
      if (grupoId) {
        this.grupoId = grupoId;
        this.cargarNombreAlbum();
        this.cargarFotos();
      } else {
        console.error('Grupo ID no disponible');
      }
    });
  }

  async cargarFotos() {
    this.fotos = await this.galeriaService.obtenerFotosDeAlbum(this.grupoId, this.albumId);
  }

  async cargarNombreAlbum() {
    const albums = await this.galeriaService.obtenerAlbums(this.grupoId);
    const album = albums.find(a => a.id === this.albumId);
    this.nombreAlbum = album ? album.nombre : 'Álbum de Fotos';
  }

  seleccionarImagen() {
    this.fileInput.nativeElement.click();
  }

  // Adaptado para subir varias fotos a la vez
  async subirFotos(event: Event) {
    const files = (event.target as HTMLInputElement).files;
    if (!files || !this.grupoId || !this.albumId) return;

    const uploads = [];
    for (let i = 0; i < files.length; i++) {
      const file = files.item(i);
      if (file) {
        uploads.push(this.galeriaService.subirFotoEnAlbum(this.grupoId, this.albumId, file));
      }
    }

    await Promise.all(uploads);

    this.fileInput.nativeElement.value = '';
    await this.cargarFotos();
  }

  async ampliarImagen(foto: any) {
    const modal = await this.modalController.create({
      component: ModalImagenAmpliadaComponent,
      componentProps: {
        imagenActual: foto,
        listaImagenes: this.fotos
      },
      breakpoints: [0, 1],
      initialBreakpoint: 1,
      canDismiss: true,
      showBackdrop: true
    });

    await modal.present();
  }

  async doRefresh(event: any) {
    try {
      this.isLoading = true;
      await this.cargarNombreAlbum();
      await this.cargarFotos();
    } catch (error) {
      console.error('Error al refrescar:', error);
    } finally {
      this.isLoading = false;
      event.target.complete();
    }
  }

  async confirmarEliminacionFoto(foto: any) {
  const alert = await this.alertController.create({
    header: 'Eliminar imagen',
    message: '¿Seguro que quieres eliminar esta imagen?',
    buttons: [
      {
        text: 'Cancelar',
        role: 'cancel'
      },
      {
        text: 'Eliminar',
        handler: async () => {
          try {
            await this.galeriaService.eliminarFotoDeAlbum(this.grupoId, this.albumId, foto.id, foto.url);
            await this.cargarFotos();
            await this.galeriaService.mostrarToast('Imagen eliminada correctamente');
          } catch (error) {
            console.error('Error al eliminar la imagen:', error);
            await this.galeriaService.mostrarToast('Error al eliminar la imagen', 'danger');
          }
        }
      }
    ]
  });

  await alert.present();
}


startPress(foto: any) {
  this.longPressTimeout = setTimeout(() => {
    this.confirmarEliminacionFoto(foto);
  }, 500); // duración del "long press"
}

cancelPress() {
  clearTimeout(this.longPressTimeout);
}

}
