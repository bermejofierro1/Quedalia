import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { doc, setDoc } from 'firebase/firestore';
import { db } from 'src/app/core/firebase.config';
import { GrupoService } from 'src/app/core/services/grupo.service';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-add-tricoins',
  templateUrl: './add-tricoins.page.html',
  styleUrls: ['./add-tricoins.page.scss'],
  standalone:false
})
export class AddTricoinsPage implements OnInit {
  
  nombreNuevoTricoins = '';
  miembros: { uid: string, nombre: string }[] = [];
  miembrosSeleccionados: { uid: string, nombre: string }[] = [];
  nuevoMiembroNombre = '';
  grupoId = '';

  constructor(
    private userService: UserService,
    private grupoService: GrupoService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    // Asumiendo que grupoId se establece desde algún servicio o ruta
    this.grupoService.getGrupoId().subscribe(async id => {
      if (id) {
        this.grupoId = id;
        await this.cargarMiembrosDelGrupo();
      }
    });
  }

  async cargarMiembrosDelGrupo() {
    const grupo = await this.grupoService.obtenerGrupoPorId(this.grupoId);
    if (!grupo) return;

    const uidsSet = new Set<string>();
    if (grupo.creadorId) uidsSet.add(grupo.creadorId);
    if (Array.isArray(grupo.miembros)) {
      grupo.miembros.forEach((uid: string) => uidsSet.add(uid));
    }

    const uids = Array.from(uidsSet);
    this.miembros = [];

    for (const uid of uids) {
      const userData = await this.userService.getUserById(uid);
      this.miembros.push({
        uid,
        nombre: userData?.nombre || userData?.displayName || uid,
      });
    }
  }

  toggleSeleccionMiembro(miembro: { uid: string; nombre: string }) {
    const index = this.miembrosSeleccionados.findIndex(m => m.uid === miembro.uid);
    if (index > -1) {
      this.miembrosSeleccionados.splice(index, 1);
    } else {
      this.miembrosSeleccionados.push(miembro);
    }
  }

  isMiembroSeleccionado(miembro: { uid: string }): boolean {
    return this.miembrosSeleccionados.some(m => m.uid === miembro.uid);
  }

  agregarMiembroFicticio() {
    const nombre = this.nuevoMiembroNombre.trim();
    if (!nombre) return;
    const ficticio = { uid: 'fict_' + Date.now(), nombre };
    this.miembros.push(ficticio);
    this.miembrosSeleccionados.push(ficticio);
    this.nuevoMiembroNombre = '';
  }

async crearTricoins() {
  if (!this.nombreNuevoTricoins.trim()) {
    alert('Introduce un nombre para el Tricoins');
    return;
  }
  if (this.miembrosSeleccionados.length === 0) {
    alert('Selecciona al menos un miembro');
    return;
  }

  try {
    const tricoinsDocRef = doc(db, 'grupos', this.grupoId, 'tricoins', 'activo');

    // Crear mapa uid -> nombre solo para miembros ficticios
    const miembrosFicticiosMap: Record<string, string> = {};
    this.miembrosSeleccionados.forEach(m => {
      if (m.uid.startsWith('fict_')) {
        miembrosFicticiosMap[m.uid] = m.nombre;
      }
    });

    await setDoc(tricoinsDocRef, {
      nombre: this.nombreNuevoTricoins,
      miembros: this.miembrosSeleccionados.map(m => m.uid),
      miembrosFicticios: miembrosFicticiosMap,
      creadoEn: Date.now(),
    });

    this.router.navigate(['../'], { relativeTo: this.route });

  } catch (error) {
    console.error('Error creando Tricoins:', error);
    alert('Error al crear el Tricoins');
  }
}
}
