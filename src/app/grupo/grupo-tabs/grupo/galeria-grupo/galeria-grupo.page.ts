import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ActionSheetController, AlertController, ModalController, NavController, ToastController } from '@ionic/angular';
import { GaleriaService } from 'src/app/core/services/galeria.service';
import { GrupoService } from 'src/app/core/services/grupo.service';
import { ModalImagenAmpliadaComponent } from 'src/app/shared/modal-imagen-ampliada/modal-imagen-ampliada.component';

@Component({
  selector: 'app-galeria-grupo',
  templateUrl: './galeria-grupo.page.html',
  styleUrls: ['./galeria-grupo.page.scss'],
  standalone: false
})
export class GaleriaGrupoPage implements OnInit {
  grupoId = '';
  fotos: any[] = [];
  fechaFiltro = '';
  albums: any[] = [];
  filtros = {
    fecha: '',
    usuario: ''
  };
  mostrarFecha = false;
  usuariosUnicos: string[] = [];
  todasLasFotos: any[] = []; //mantiene una copia original
  imagenAmpliada: any = null;
  mostrarFiltros = false;
  isLoading = false;
  private holdTimeout: any;

  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('contentRef', { static: false }) contentRef!: ElementRef;

  constructor(
    private galeriaService: GaleriaService,
    private grupoService: GrupoService,
    private alertController: AlertController,
    private router: Router,
    private modalctrl: ModalController,
    private actionSheetController:ActionSheetController,
    private navController:NavController,
    private toastController:ToastController
  ) { }

  ngOnInit() {
    this.grupoService.getGrupoId().subscribe(id => {
      if (id) {
        this.grupoId = id;
        this.cargarFotos();
    this.cargarAlbums();
      } else {
        console.warn('grupoId no está disponible');
      }
    })
    
  }

  async cargarFotos() {
    this.todasLasFotos = await this.galeriaService.obtenerFotosGrupo(this.grupoId);
    this.fotos = [...this.todasLasFotos];

    // Extraer nombres únicos de usuario para el filtro
    const nombres = this.todasLasFotos
      .map(f => f.nombreUsuario || 'Desconocido')
      .filter((valor, i, arr) => arr.indexOf(valor) === i);
    this.usuariosUnicos = nombres;
  }


  filtrarPorFecha() {
    if (!this.fechaFiltro) {
      // Sin filtro
      this.fotos = [...this.fotos];
    } else {
      const fechaSeleccionada = new Date(this.fechaFiltro);
      this.fotos = this.fotos.filter(foto => {
        let fecha: Date;
        if (foto.fechaSubida?.toDate) {
          fecha = foto.fechaSubida.toDate();
        } else if (foto.fechaSubida instanceof Date) {
          fecha = foto.fechaSubida;
        } else {
          fecha = new Date(foto.fechaSubida);
        }
        return fecha.toDateString() === fechaSeleccionada.toDateString();
      });
    }
  }

  seleccionarImagen() {
    this.fileInput.nativeElement.click();
  }

  async subirFotos(event: Event) {
    const files = (event.target as HTMLInputElement).files;
    if (!files || !this.grupoId) return;

    const uploads = [];
    for (let i = 0; i < files.length; i++) {
      const file = files.item(i);
      if (file) {
        uploads.push(this.galeriaService.subirFoto(this.grupoId, file));
      }
    }

    await Promise.all(uploads);

    this.fileInput.nativeElement.value = '';
    await this.cargarFotos();
  }

  async abrirModalCrearAlbum() {
    const alert = await this.alertController.create({
      header: 'Nuevo Álbum',
      inputs: [
        {
          name: 'nombre',
          type: 'text',
          placeholder: 'Ej: Sevilla'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Crear',
          handler: async (data) => {
            const nombre = data.nombre?.trim();
            if (nombre) {
              await this.galeriaService.crearAlbum(this.grupoId, nombre);
              await this.cargarAlbums();
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async cargarAlbums() {
    this.albums = await this.galeriaService.obtenerAlbums(this.grupoId);
  }


  verAlbum(albumId: string) {
    this.galeriaService.setAlbumId(albumId);
    this.router.navigate(['/grupo/tabs/grupo/galeria-grupo/album-galeria']);
  }

  async ampliarImagen(foto: any) {
    const modal = await this.modalctrl.create({
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

  aplicarFiltros() {
    const { fecha, usuario } = this.filtros;

    this.fotos = this.todasLasFotos.filter(foto => {
      let coincideFecha = true;
      let coincideUsuario = true;

      if (fecha) {
        const fechaSeleccionada = new Date(fecha).toDateString();
        const fechaFoto = new Date(foto.fechaSubida?.toDate?.() || foto.fechaSubida).toDateString();
        coincideFecha = fechaFoto === fechaSeleccionada;
      }

      if (usuario) {
        coincideUsuario = foto.nombreUsuario === usuario;
      }

      return coincideFecha && coincideUsuario;
    });
  }

  limpiarFiltros() {
    this.filtros = {
      fecha: '',
      usuario: ''
    };
    this.fotos = [...this.todasLasFotos];
  }

 async doRefresh(event: any) {
    this.isLoading = true;
    const content = this.contentRef?.nativeElement;
    if (content) content.classList.add('blur-activo');
    try{
   await this.cargarAlbums();
   await this.cargarFotos();
}catch(error){
  console.error('Error al recargar la página',error);
}finally{
  this.isLoading = false;
      if (content) content.classList.remove('blur-activo');
      event.target.complete();
}
    
    

    
  }

  /*EFECTO PARA PULSAR EN UN ALBUM*/ 
  iniciarPulsacionLarga(event: any, album: any) {
  this.holdTimeout = setTimeout(() => {
    this.abrirOpcionesAlbum(album);
  }, 700); 
}

cancelarPulsacionLarga() {
  clearTimeout(this.holdTimeout);
}

async abrirOpcionesAlbum(album: any) {
  const actionSheet = await this.actionSheetController.create({
    header: 'Opciones del álbum',
    buttons: [
      {
        text: 'Abrir álbum',
        icon: 'eye',
        handler: () => this.verAlbum(album.id),
      },
      {
        text: 'Editar nombre',
        icon: 'create',
        handler: () => this.editarNombreAlbum(album),
      },
      {
        text: 'Eliminar álbum',
        role: 'destructive',
        icon: 'trash',
        handler: () => this.confirmarEliminacion(album),
      },
      {
        text: 'Cancelar',
        role: 'cancel'
      }
    ]
  });

  await actionSheet.present();
}

abrirAlbum(album: any) {
  this.galeriaService.setAlbumId(album.id);
  this.navController.navigateForward('/tabs/grupos/galeria/' + album.id);
}
async editarNombreAlbum(album: any) {

  
}


async confirmarEliminacion(album: any) {
  const alert = await this.alertController.create({
    header: 'Eliminar álbum',
    message: `¿Seguro que deseas eliminar "${album.nombre}" y todas sus fotos?`,
    buttons: [
      {
        text: 'Cancelar',
        role: 'cancel'
      },
      {
        text: 'Eliminar',
        role: 'destructive',
        handler: async () => {
          try {
            if (!album?.id) {
              console.error('Album id inválido');
              return;
            }
            await this.galeriaService.eliminarAlbum(this.grupoId, album.id);
            await this.cargarAlbums();

            // Llamada al método del servicio para mostrar toast
            await this.galeriaService.mostrarToast(`Álbum "${album.nombre}" eliminado correctamente.`);
          } catch (error) {
            console.error('Error eliminando álbum:', error);
          }
        }
      }
    ]
  });

  await alert.present();
}

}
