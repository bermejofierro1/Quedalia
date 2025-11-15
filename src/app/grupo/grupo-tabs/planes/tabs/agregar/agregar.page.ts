import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GrupoService } from 'src/app/core/services/grupo.service';
import { PlanService } from 'src/app/core/services/plan.service';
import { StorageService } from 'src/app/core/services/storage.service';
@Component({
  selector: 'app-agregar',
  templateUrl: './agregar.page.html',
  styleUrls: ['./agregar.page.scss'],
  standalone: false
})
export class AgregarPage implements OnInit {
  form!: FormGroup;
  grupoId!: string;
  ubicacion: { lat: number; lng: number } | null = null;
  cargando: boolean = false;
  mostrarInputCiudadPersonalizada = false;
  ciudadPersonalizada = '';
  fechasDelGrupo: string[] = [];

  @ViewChild('fileInput') fileInput!: ElementRef;
  fotoArchivo: File | null = null;
  fotoPreview: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private planService: PlanService,
    private grupoService: GrupoService,
    private storageService: StorageService,

  ) { }

  ngOnInit() {
    this.form = this.fb.group({
      titulo: ['', Validators.required],
      descripcion: ['', Validators.required],
      fechasPropuestas: [''],
      esPublico: [false],
      direccion: [''],
      ciudad: ['', Validators.required],
      ciudadPersonalizada: ['']
    });


    this.grupoService.getGrupoId().subscribe(id => {
      if (id) {
        this.grupoId = id;
        this.cargarFechasDelGrupo(id);
      } else {
        console.warn('grupoId no está disponible');
      }
    });
  }

  ionViewWillEnter() {
    const state = history.state;
    if (state.ubicacion) {
      const { lat, lng } = state.ubicacion;
      this.ubicacion = { lat, lng };
      console.log('Ubicación a guardar', this.ubicacion);

      this.form.patchValue({
        direccion: `${lat.toFixed(5)}, ${lng.toFixed(5)}`
      });

      console.log('Ubicación recuperada en ionViewWillEnter:', this.ubicacion);
    }
  }

  private async cargarFechasDelGrupo(id: string) {
    this.grupoService.getGrupoId().subscribe(async id => {
      if (id) {
        this.grupoId = id;
        this.fechasDelGrupo = await this.grupoService.obtenerFechasDesdeRangoGrupo(id);
        console.log('Fechas generadas a partir del rango o día:', this.fechasDelGrupo);
        this.form.patchValue({
          fechasPropuestas: this.fechasDelGrupo.join(', ')
        });
      }
    });

  }


  onFileSelected(event: any) {
    const archivo = event.target.files[0];
    if (archivo) {
      this.fotoArchivo = archivo;
      const reader = new FileReader();
      reader.onload = () => {
        this.fotoPreview = reader.result as string;
      };
      reader.readAsDataURL(archivo);
    }
  }

  abrirSelectorUbicacion() {
    this.router.navigate(['seleccionar-ubicacion'], {
      relativeTo: this.route,
    });
  }

capitalizar(texto: string): string {
  return texto
    .trim()
    .toLowerCase()
    .split(' ')
    .map(p => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ');
}


  onCiudadChange(event: any) {
    const seleccion = event.detail.value;
    this.mostrarInputCiudadPersonalizada = seleccion === 'Otra';
    if (seleccion !== 'Otra') {
      this.ciudadPersonalizada = '';
    }
  }

  async crearPlan() {
    if (this.form.invalid || this.cargando) return;
    this.cargando = true;

    let fotoURL = '';
    if (this.fotoArchivo) {
      const ruta = `planes/${this.grupoId}/${Date.now()}_${this.fotoArchivo.name}`;
      fotoURL = await this.storageService.subirArchivo(ruta, this.fotoArchivo) || '';
    }
    const ciudadForm = this.form.value;
    const ciudadElegida = ciudadForm.ciudad === 'Otra' && ciudadForm.ciudadPersonalizada
      ? this.capitalizar(ciudadForm.ciudadPersonalizada.trim())
      : ciudadForm.ciudad;

    const planData = {
      ...this.form.value,
      ciudad: ciudadElegida,
      ubicacion: this.ubicacion || null,
      foto: fotoURL,
      fechasPropuestas: this.fechasDelGrupo.length > 0
        ? this.fechasDelGrupo
        : this.form.value.fechasPropuestas.split(',').map((f: string) => f.trim()).filter((f: string) => f),
    };

    if (ciudadForm.ciudad === 'Otra' && !ciudadForm.ciudadPersonalizada.trim()) {
      this.planService.mostrarAlerta('Debes introducir tu ciudad personalizada.', 'danger');
      this.cargando = false;
      return;
    }


    try {
      await this.planService.crearPlan(this.grupoId, planData);
      this.grupoService.refreshGrupos();
      this.form.reset({
        titulo: '',
        descripcion: '',
        fechasPropuestas: '',
        esPublico: false,
        direccion: '',
        ciudad: ''
      });
      this.fotoArchivo = null;
      this.fotoPreview = null;
      this.ubicacion = null;
      this.mostrarInputCiudadPersonalizada = false;
      this.ciudadPersonalizada = '';
      this.planService.mostrarAlerta('¡Plan creado con éxito!', 'Tu plan se ha guardado correctamente.');
      this.router.navigate(['../../'], { relativeTo: this.route });
    } catch (error) {
      console.error('Error creando plan:', error);
      this.planService.mostrarAlerta('Error al crear el plan. Intenta de nuevo.', 'danger');
    } finally {
      this.cargando = false;
    }
  }



}
