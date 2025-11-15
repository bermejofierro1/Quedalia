import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GrupoService } from 'src/app/core/services/grupo.service';
import { AlertController } from '@ionic/angular';
import { auth, db } from 'src/app/core/firebase.config';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { StorageService } from 'src/app/core/services/storage.service';
import { Grupo } from 'src/app/models/grupo.model';
import { UserService } from 'src/app/core/services/user.service';
import { Share } from '@capacitor/share'
@Component({
  selector: 'app-grupo',
  templateUrl: './grupo.page.html',
  styleUrls: ['./grupo.page.scss'],
  standalone: false
})

export class GrupoPage implements OnInit {

  grupoId: string | null = null;
  grupoData: Grupo | null = null;
  miembrosCount: number = 0;
  fechaFinalElegida: string | null = null;
  votacionEstado: string = 'abierta';
  userId: string = '';

  creadorNombre = '';
  creadorFoto = '';
  miembrosLista: { uid: string; nombre: string; foto?: string }[] = [];
  mostrarMiembros = false;
  isLoading=false;

  grupoSub: (() => void) | null = null; // suscripción a onSnapshot

  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef;
  @ViewChild('contentRef', { static: false }) contentRef!: ElementRef;


  constructor(
    private grupoService: GrupoService,
    private router: Router,
    private route: ActivatedRoute,
    private storageService: StorageService,
    private userService: UserService
  ) { }

  ngOnInit() {
    this.grupoService.getGrupoId().subscribe(id => {
      if (id) {
        this.grupoId = id;
        this.userId = auth.currentUser?.uid || '';
        this.cargarDatos();
      } else {
        console.warn('grupoId no está disponible');
      }
    });
  }


  ngOnDestroy() {
    if (this.grupoSub) {
      this.grupoSub();  // cancelar la suscripción para evitar fugas de memoria
      this.grupoSub = null;
    }
  }

  cargarDatos() {
    if (!this.grupoId) return;

    const grupoDocRef = doc(db, 'grupos', this.grupoId);

    // Cancelar suscripción anterior si la hay
    if (this.grupoSub) this.grupoSub();

    // Nueva suscripción
    this.grupoSub = onSnapshot(grupoDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as Grupo;
        this.grupoData = data;
        this.miembrosCount = data.miembros?.length || 0;
        this.fechaFinalElegida = data.fechaFinalElegida || null;
        this.votacionEstado = data.votacionEstado || 'abierta';

        this.cargarUsuarios();
      }
    });
  }


  async cargarUsuarios() {
    if (!this.grupoData) return;

    // Obtener datos del creador
    const creadorInfo = await this.userService.getUserById(this.grupoData.creadorId);
    this.creadorNombre = creadorInfo?.nombre || 'Sin nombre';
    this.creadorFoto = creadorInfo?.foto || '';

    // Obtener datos de miembros
    this.miembrosLista = [];
    for (const uid of this.grupoData.miembros || []) {
      const userInfo = await this.userService.getUserById(uid);
      this.miembrosLista.push({
        uid,
        nombre: userInfo?.nombre || 'Sin nombre',
        foto: userInfo?.foto
      });
    }
  }


  toggleMostrarMiembros() {
    this.mostrarMiembros = !this.mostrarMiembros;
  }

  seleccionarImagen() {
    this.fileInput.nativeElement.click();
  }

  async subirFotoGrupo(event: any) {
    const archivo = event.target.files[0];
    if (!archivo || !this.grupoId) return;

    const ruta = `grupos/${this.grupoId}/foto.jpg`;
    const url = await this.storageService.subirArchivo(ruta, archivo);

    if (url) {
      // Guardar en Firestore
      const grupoRef = doc(db, 'grupos', this.grupoId);
      await updateDoc(grupoRef, { foto: url });

      // Actualizar localmente para reflejar cambio inmediato
      if (url && this.grupoData) {
        const grupoRef = doc(db, 'grupos', this.grupoId);
        await updateDoc(grupoRef, { foto: url });
        this.grupoData.foto = url;
      }

    }
  }

  async compartirCodigo() {
    if (!this.grupoData) return;

    const mensaje = `Únete a nuestro grupo de Quedalia con este código: ${this.grupoData.shareCode}`;

    try {
      await Share.share({
        title: 'Código de acceso al grupo',
        text: mensaje,
      });
    } catch (err) {
      console.error('Error al compartir:', err);
    }
  }

  irAGrupos() {
    this.router.navigate(['/tabs/grupos']);
  }

  irAVotaciones() {
    this.router.navigate(['fechas'], { relativeTo: this.route });
  }

  irAGaleria() {
    this.router.navigate(['galeria-grupo'], { relativeTo: this.route });
  }

  //refrescar la página
  doRefresh(event: any) {
    this.isLoading=true;
    const content = this.contentRef?.nativeElement;
  if (content) content.classList.add('blur-activo');

  this.cargarDatos();

  setTimeout(() => {
    this.isLoading=false;
    if (content) content.classList.remove('blur-activo');
    event.target.complete();
  }, 1000);
  }




}








