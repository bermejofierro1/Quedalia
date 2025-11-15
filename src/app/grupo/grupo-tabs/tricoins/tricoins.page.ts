import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, AlertInput } from '@ionic/angular';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from 'src/app/core/firebase.config';
import { GrupoService } from 'src/app/core/services/grupo.service';
import { TricoinPago, TricoinsService } from 'src/app/core/services/tricoins.service';
import { UserService } from 'src/app/core/services/user.service';


@Component({
  selector: 'app-tricoins',
  templateUrl: './tricoins.page.html',
  styleUrls: ['./tricoins.page.scss'],
  standalone: false
})
export class TricoinsPage implements OnInit {
  grupoId = '';
  miembros: { uid: string; nombre: string }[] = [];
  pagos: TricoinPago[] = [];
  deudas: { deudor: string; acreedor: string; cantidad: number }[] = [];
  tricoinsData: { nombre: string } | null = null;
  resumenUsuarios: { uid: string; nombre: string; pagado: number; debe: number }[] = [];
  mostrandoInicializar = false;
  isLoading = false;

  @ViewChild('contentRef', { static: false }) contentRef!: ElementRef;

  constructor(
    private grupoService: GrupoService,
    private tricoinsService: TricoinsService,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private alertCtrl: AlertController
  ) { }

  ngOnInit() {
    // Obtengo el grupoId 
    this.grupoService.getGrupoId().subscribe(id => {
      if (id) {
        this.grupoId = id;
      }
    });
  }

  //se ejecuta cada vez que la página entra en vista
  ionViewWillEnter() {
    if (this.grupoId) {
      this.cargarTodo();
    }
  }

  // Carga toda la info necesaria y actualiza variables
  async cargarTodo() {
    try {
      console.log('Cargando datos tricoins...');
      const { tricoinsData, miembros } = await this.tricoinsService.cargarDatosTricoins(this.grupoId);
      console.log('Datos cargados:', { tricoinsData, miembros });
      if (!tricoinsData) {
        // Si no hay tricoins activo, redirige a inicializar
        this.router.navigate(['add-tricoins'], { relativeTo: this.route });
        return;
      }

      this.tricoinsData = tricoinsData;
      this.miembros = miembros;

      this.pagos = await this.tricoinsService.obtenerPagos(this.grupoId);
      this.deudas = await this.tricoinsService.calcularDeudas(this.grupoId);

      const resumenBase = await this.tricoinsService.calcularPagosYDeudasPorUsuario(this.grupoId);
      this.resumenUsuarios = resumenBase.map((res) => ({
        ...res,
        nombre: this.nombreDeUsuario(res.uid)
      }));

      this.mostrandoInicializar = false;
    } catch (error) {
      console.error('Error cargando datos Tricoins:', error);
    }
  }

  // Devuelve nombre asociado al uid o el uid si no lo encuentra
  nombreDeUsuario(uid: string): string {
    return this.miembros.find(m => m.uid === uid)?.nombre || uid;
  }

  irAnhadirGasto() {
    this.router.navigate(['add-pago'], { relativeTo: this.route });
  }

  // Convierte array de uids a cadena de nombres, filtra vacíos
  getNombresInvolucrados(uids: string[]): string {
    if (!uids?.length) return '';
    return uids
      .map(uid => this.nombreDeUsuario(uid))
      .filter(Boolean)
      .join(', ');
  }

  // Alert para elegir tipo de miembro a añadir
  async abrirAlertaAnadirMiembro() {
    const alert = await this.alertCtrl.create({
      header: 'Añadir miembro',
      message: '¿Qué tipo de miembro quieres añadir?',
      buttons: [
        { text: 'Miembro real', handler: () => this.anadirMiembroReal() },
        { text: 'Miembro ficticio', handler: () => this.abrirAlertaMiembroFicticio() },
        { text: 'Cancelar', role: 'cancel' }
      ]
    });
    await alert.present();
  }

  // Alert para crear nuevo miembro ficticio
  async abrirAlertaMiembroFicticio() {
    const alert = await this.alertCtrl.create({
      header: 'Nuevo miembro ficticio',
      inputs: [{ name: 'nombre', type: 'text', placeholder: 'Nombre del nuevo miembro' }],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Añadir',
          handler: async (data) => {
            if (data.nombre?.trim()) {
              await this.tricoinsService.anadirMiembroFicticio(this.grupoId, data.nombre.trim());
              await this.cargarTodo();
            }
          }
        }
      ]
    });
    await alert.present();
  }

  // Selección y adición de miembro real
  async anadirMiembroReal() {
    try {
      const grupoData = await this.grupoService.obtenerGrupoPorId(this.grupoId);
      if (!grupoData) return;

      const miembrosGrupo: string[] = grupoData.miembros || [];
      const actuales: string[] = this.miembros.map(m => m.uid);
      const disponibles = miembrosGrupo.filter(uid => !actuales.includes(uid));

      if (disponibles.length === 0) {
        const alert = await this.alertCtrl.create({
          header: 'Sin miembros disponibles',
          message: 'Todos los miembros del grupo ya están añadidos a Tricoins.',
          buttons: ['OK']
        });
        await alert.present();
        return;
      }

      // Prepara inputs para alert radio buttons con usuarios disponibles
      const inputs: AlertInput[] = await Promise.all(
        disponibles.map(async uid => {
          const user = await this.userService.getUserById(uid);
          return {
            name: uid,
            type: 'radio',
            label: user?.nombre || user?.displayName || uid,
            value: uid
          };
        })
      );

      const selectAlert = await this.alertCtrl.create({
        header: 'Selecciona un usuario',
        inputs,
        buttons: [
          { text: 'Cancelar', role: 'cancel' },
          {
            text: 'Añadir',
            handler: async (uidSeleccionado: string) => {
              if (uidSeleccionado) {
                await this.tricoinsService.anadirMiembroReal(this.grupoId, uidSeleccionado);
                await this.cargarTodo();
              }
            }
          }
        ]
      });
      await selectAlert.present();
    } catch (error) {
      console.error('Error añadiendo miembro real:', error);
    }
  }

 async doRefresh(event: any) {
    this.isLoading = true;
     const content = this.contentRef?.nativeElement;
    if (content) content.classList.add('blur-activo');
    try {
     await this.cargarTodo();
    } catch (error) {
      console.error('Error al refrescar datos Tricoins:', error);
    } finally {
      this.isLoading = false;
       if (content) content.classList.remove('blur-activo');
      event.target.complete();
    }

  }
}
