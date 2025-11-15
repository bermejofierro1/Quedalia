import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { auth, db, storage } from 'src/app/core/firebase.config';
import { AuthService } from 'src/app/core/services/auth.service';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-ajustes',
  templateUrl: './ajustes.page.html',
  styleUrls: ['./ajustes.page.scss'],
  standalone: false
})
export class AjustesPage implements OnInit {

  userId: string = '';
  nombre: string = '';
  email: string = '';
  editarNombre = false;
  fotoPerfil: string = '';
  nuevoNombre: string = '';
  cargando:boolean=true;

  segmento: 'futuros' | 'hoy' | 'pasados' = 'futuros';

gruposFiltrados: Record<'futuros' | 'hoy' | 'pasados', any[]> = {
  futuros: [],
  hoy: [],
  pasados: []
};

planesFiltrados: Record<'futuros' | 'hoy' | 'pasados', any[]> = {
  futuros: [],
  hoy: [],
  pasados: []
};


  constructor(private userService: UserService, private authService: AuthService,
    private router:Router,
    private route:ActivatedRoute
  ) { }

  async ngOnInit() {
    const usuario = this.userService.getUsuarioActual();
    if (usuario) {
      this.userId = usuario.uid;
      this.nombre = usuario.displayName || '';
      this.email = usuario.email || '';
      this.nuevoNombre = this.nombre;
       this.fotoPerfil = usuario.photoURL || 'assets/avatar-default.png';
      }
      this.cargando=false;

        await this.cargarHistorial();
  }

  activarEdicion() {
    this.editarNombre = true;
    this.nuevoNombre = this.nombre;
  }

  guardarCambios() {
    if (this.nuevoNombre.trim() === '') return;

    this.userService.actualizarNombre(this.nuevoNombre).then(() => {
      this.nombre = this.nuevoNombre;
      this.editarNombre = false;
      alert('Nombre actualizado correctamente');
    }).catch(err => {
      console.error(err);
      alert('Error al actualizar el nombre');
    });
  }

   seleccionarImagen() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file || !this.userId) return;

      try {
        const storageRef = ref(storage, `avatars/${this.userId}`);
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);

        await updateProfile(auth.currentUser!, {
          photoURL: downloadURL
        });

         // ✅ Actualiza en Firestore (colección 'usuarios')
      const userRef = doc(db, 'usuarios', this.userId);
      await setDoc(userRef, {
        foto: downloadURL
      }, { merge: true });

        this.fotoPerfil = downloadURL;
      } catch (err) {
        console.error('Error al subir imagen:', err);
        alert('No se pudo subir la imagen');
      }
    };

    input.click();
  }

  //HISTORIAL DE PLANES Y GRUPOS
  formatearFecha(date: Date): string {
  const d = date.getDate().toString().padStart(2, '0');
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}

esFechaPasada(fechaStr: string): boolean {
  const [d, m, y] = fechaStr.split('/').map(Number);
  const fecha = new Date(y, m - 1, d);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return fecha < hoy;
}

async cargarHistorial() {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const hoyStr = this.formatearFecha(hoy);

  const grupos = await this.userService.getGruposDelUsuario(); 
  const planes = await this.userService.getPlanesDelUsuario();

  console.log('Grupos recibidos en AjustesPage:', grupos);
  console.log('Planes recibidos en AjustesPage:', planes);

  // === GRUPOS ===
  this.gruposFiltrados = { futuros: [], hoy: [], pasados: [] };
  grupos.forEach(grupo => {
    const fecha = grupo.fechaFinalElegida;
    if (!fecha) return;

    if (fecha === hoyStr) this.gruposFiltrados.hoy.push(grupo);
    else if (this.esFechaPasada(fecha)) this.gruposFiltrados.pasados.push(grupo);
    else this.gruposFiltrados.futuros.push(grupo);
  });

  // === PLANES ===
  this.planesFiltrados = { futuros: [], hoy: [], pasados: [] };
  planes.forEach(plan => {
    let categoria: 'futuros' | 'hoy' | 'pasados' | null = null;

    if (plan.esPublico === false) {
      const fechaStr = plan.fechaFinalElegida;
      if (!fechaStr) return;

      const [d, m, y] = fechaStr.split('/').map(Number);
      const fecha = new Date(y, m - 1, d);
      fecha.setHours(0, 0, 0, 0);

      if (fecha.getTime() === hoy.getTime()) categoria = 'hoy';
      else if (fecha < hoy) categoria = 'pasados';
      else categoria = 'futuros';

    } else {
      if (!Array.isArray(plan.fechasPropuestas) || plan.fechasPropuestas.length === 0) return;

      const fechas: Date[] = plan.fechasPropuestas.map((f: string) => {
        const d = new Date(f);
        d.setHours(0, 0, 0, 0);
        return d;
      }).filter((f: Date) => !isNaN(f.getTime()));


      if (fechas.length === 0) return;

      const hayHoy = fechas.some(f => f.getTime() === hoy.getTime());
      const todasPasadas = fechas.every(f => f < hoy);
      const todasFuturas = fechas.every(f => f > hoy);

      if (hayHoy) categoria = 'hoy';
      else if (todasPasadas) categoria = 'pasados';
      else if (todasFuturas) categoria = 'futuros';
      else categoria = 'futuros'; 
    }

    if (categoria) this.planesFiltrados[categoria].push(plan);
  });

  console.log('Planes filtrados:', this.planesFiltrados);
}

verFavoritos() {
 this.router.navigate(['favoritos'], { relativeTo: this.route });

}



  cerrarSesion() {
    this.authService.logout();
  }

}
