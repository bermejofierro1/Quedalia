import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { doc, getDoc } from 'firebase/firestore';
import { db } from 'src/app/core/firebase.config';
import { GrupoService } from 'src/app/core/services/grupo.service';
import { TricoinsService } from 'src/app/core/services/tricoins.service';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-add-pago',
  templateUrl: './add-pago.page.html',
  styleUrls: ['./add-pago.page.scss'],
  standalone:false
})
export class AddPagoPage implements OnInit {

  grupoId: string = '';

  descripcion: string = '';
  cantidad: number | null = null;
  pagadoPor: string = '';
  involucrados: string[] = [];

  miembros: { uid: string, nombre: string }[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tricoinsService: TricoinsService,
  private userService:UserService,
  private grupoService:GrupoService
  ) {}

async ngOnInit() {
  this.grupoService.getGrupoId().subscribe(async id => {
    if (id) {
      this.grupoId = id;
      await this.cargarMiembrosTricoins();
    }
  });
}


  async cargarMiembrosTricoins() {
    if (!this.grupoId) {
  console.error('grupoId no definido');
  return;
}
  const tricoinsDocRef = doc(db, 'grupos', this.grupoId, 'tricoins', 'activo');
  const tricoinsSnap = await getDoc(tricoinsDocRef);

  if (!tricoinsSnap.exists()) {
    console.warn('No hay tricoins activo');
    return;
  }

  const tricoinsData = tricoinsSnap.data();

  const miembrosUids: string[] = tricoinsData?.['miembros'] || [];
  const miembrosFicticiosMap: { [key: string]: string } = tricoinsData?.['miembrosFicticios'] || {};

  // Para miembros reales (no ficticios) cargamos sus nombres desde UserService
  const usuarios: { uid: string, nombre: string }[] = [];

  for (const uid of miembrosUids) {
    if (uid.startsWith('fict_')) {
      // Es ficticio, poner nombre desde miembrosFicticios
      const nombreFicticio = miembrosFicticiosMap[uid] || 'Sin nombre';
      usuarios.push({ uid, nombre: nombreFicticio });
    } else {
      // Es usuario real, buscar nombre en UserService
      const userData = await this.userService.getUserById(uid);
      usuarios.push({
        uid,
        nombre: userData?.nombre || userData?.displayName || uid,
      });
    }
  }

  this.miembros = usuarios;
  console.log(this.miembros);
}


  toggleInvolucrado(uid: string) {
    if (this.involucrados.includes(uid)) {
      this.involucrados = this.involucrados.filter(i => i !== uid);
    } else {
      this.involucrados.push(uid);
    }
  }

  async guardarPago() {
    if (!this.descripcion.trim()) {
      alert('Introduce una descripción del pago');
      return;
    }
    if (!this.cantidad || this.cantidad <= 0) {
      alert('Introduce una cantidad válida');
      return;
    }
    if (!this.pagadoPor) {
      alert('Selecciona quién pagó');
      return;
    }
    if (this.involucrados.length === 0) {
      alert('Selecciona al menos un involucrado');
      return;
    }

    try {
      await this.tricoinsService.agregarPago(this.grupoId, {
        grupoId: this.grupoId,
        descripcion: this.descripcion.trim(),
        cantidad: this.cantidad,
        pagadoPor: this.pagadoPor,
        involucrados: this.involucrados,
      });
      this.router.navigate(['../'], { relativeTo: this.route });
    } catch (error) {
      console.error('Error guardando pago:', error);
      alert('Error guardando el pago');
    }
  }

  

}
