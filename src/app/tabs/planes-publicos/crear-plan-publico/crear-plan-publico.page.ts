import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GrupoService } from 'src/app/core/services/grupo.service';
import { PlanService } from 'src/app/core/services/plan.service';
import { StorageService } from 'src/app/core/services/storage.service';

@Component({
  selector: 'app-crear-plan-publico',
  templateUrl: './crear-plan-publico.page.html',
  styleUrls: ['./crear-plan-publico.page.scss'],
  standalone:false
})
export class CrearPlanPublicoPage implements OnInit {
 form!: FormGroup;
  ubicacion: { lat: number; lng: number } | null = null;
  cargando: boolean = false;
  mostrarInputCiudadPersonalizada = false;
  ciudadPersonalizada = '';

  @ViewChild('fileInput') fileInput!: ElementRef;
  fotoArchivo: File | null = null;
  fotoPreview: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private planService: PlanService,
    private storageService: StorageService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      titulo: ['', Validators.required],
      descripcion: ['', Validators.required],
      fechasPropuestas: [[], Validators.required],
      direccion: [''],
      ciudad: ['', Validators.required],
      ciudadPersonalizada: ['']
    });
  }

  ionViewWillEnter() {
    const state = history.state;
    if (state.ubicacion) {
      const { lat, lng } = state.ubicacion;
      this.ubicacion = { lat, lng };
      this.form.patchValue({
        direccion: `${lat.toFixed(5)}, ${lng.toFixed(5)}`
      });
    }
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
    this.router.navigate(['seleccionar-ubicacion'], { relativeTo: this.route });
  }

  onCiudadChange(event: any) {
    const seleccion = event.detail.value;
    this.mostrarInputCiudadPersonalizada = seleccion === 'Otra';
    if (seleccion !== 'Otra') {
      this.ciudadPersonalizada = '';
    }
  }

  capitalizar(texto: string): string {
    return texto
      .trim()
      .toLowerCase()
      .split(' ')
      .map(p => p.charAt(0).toUpperCase() + p.slice(1))
      .join(' ');
  }

  async crearPlan() {
    if (this.form.invalid || this.cargando) return;
    this.cargando = true;

    let fotoURL = '';
    if (this.fotoArchivo) {
      const ruta = `planes/publicos/${Date.now()}_${this.fotoArchivo.name}`;
      fotoURL = await this.storageService.subirArchivo(ruta, this.fotoArchivo) || '';
    }

    const ciudadForm = this.form.value;
    const ciudadElegida = ciudadForm.ciudad === 'Otra' && ciudadForm.ciudadPersonalizada
      ? this.capitalizar(ciudadForm.ciudadPersonalizada.trim())
      : ciudadForm.ciudad;

    if (ciudadForm.ciudad === 'Otra' && !ciudadForm.ciudadPersonalizada.trim()) {
      this.planService.mostrarAlerta('Debes introducir tu ciudad personalizada.', 'danger');
      this.cargando = false;
      return;
    }

    const fechas: string[] = ciudadForm.fechasPropuestas;
    const fechaFinal = fechas.length > 0 ? fechas[fechas.length - 1] : '';

    const planData = {
      titulo: ciudadForm.titulo,
      descripcion: ciudadForm.descripcion,
      ciudad: ciudadElegida,
      ubicacion: this.ubicacion || null,
      foto: fotoURL,
      esPublico: true,
      fechasPropuestas: fechas,
      fechaFinal,
      direccion: ciudadForm.direccion
    };

    try {
      await this.planService.crearPlanPublico(planData);
      this.form.reset();
      this.fotoArchivo = null;
      this.fotoPreview = null;
      this.ubicacion = null;
      this.mostrarInputCiudadPersonalizada = false;
      this.ciudadPersonalizada = '';
      this.planService.mostrarAlerta('¡Plan público creado con éxito!', 'success');
      this.router.navigate(['/tabs/planes-publicos']);
    } catch (error) {
      console.error('Error creando plan público:', error);
      this.planService.mostrarAlerta('Error al crear el plan. Intenta de nuevo.', 'danger');
    } finally {
      this.cargando = false;
    }
  }
}
