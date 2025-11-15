import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ActionSheetController, AlertController, NavController } from '@ionic/angular';
import { GaleriaService } from 'src/app/core/services/galeria.service';
import { GrupoService } from 'src/app/core/services/grupo.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.page.html',
  standalone:false,
  styleUrls: ['./list.page.scss'],
})
export class ListPage implements OnInit {

  grupos:any[]=[];
  isLoading=false;

    @ViewChild('contentRef', { static: false }) contentRef!: ElementRef;

  constructor(private grupoService:GrupoService,private router:Router,
  ) { }

ionViewDidEnter() {
  this.grupoService.refreshGrupos();
}


ngOnInit() {
  this.grupoService.grupos$.subscribe(grupos => {
    this.grupos = grupos;
  });
}

  loadGrupos(){
    this.grupoService.getGruposUsuario().then((data)=>{
      this.grupos=data;
    })
  }
  
seleccionarGrupo(id: string) {
  this.grupoService.setGrupoId(id);
  this.router.navigate(['/grupo/tabs']);
}

doRefresh(event:any){
  this.isLoading=true;
  const content = this.contentRef?.nativeElement;
    if (content) content.classList.add('blur-activo');
  try {
  this.grupoService.refreshGrupos();
    
  } catch (error) {
     console.error('Error al refrescar datos Tricoins:', error);
  }finally{
    this.isLoading=false;
     if (content) content.classList.remove('blur-activo');
    event.target.complete();

  }
}


}
