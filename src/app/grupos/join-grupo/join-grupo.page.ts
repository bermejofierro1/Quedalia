import { Component, OnInit } from '@angular/core';
import { GrupoService } from 'src/app/core/services/grupo.service';

@Component({
  selector: 'app-join-grupo',
  templateUrl: './join-grupo.page.html',
  styleUrls: ['./join-grupo.page.scss'],
  standalone:false,
})
export class JoinGrupoPage implements OnInit {

  groupCode:string='';
  errorMessage:string='';
  successMessage:string='';

  constructor(private grupoService:GrupoService) { }

  ngOnInit() {
  }


  async joinGroup(){

    this.errorMessage='';
    this.successMessage='';

    if(!this.groupCode || this.groupCode.trim().length<3){
        this.errorMessage='Por favor, introduzca un código válido';
        return;
      }

      try {
        await this.grupoService.joinGroupByCode(this.groupCode.trim());
        this.successMessage='Enhorabuena, te has unido correctamente al grupo!';
        this.groupCode='';
      } catch (error:any) {
        this.errorMessage=error.message||'Error al unirse al grupo';
      }
  }
}
