import { Component, OnInit } from '@angular/core';
import { getAuth, sendEmailVerification } from 'firebase/auth';

@Component({
  selector: 'app-verificar-correo',
  templateUrl: './verificar-correo.page.html',
  styleUrls: ['./verificar-correo.page.scss'],
  standalone:false
})
export class VerificarCorreoPage implements OnInit {

  email:string | null=null;
  message='';
  sending=false;


  constructor() {
    const user=getAuth().currentUser;
    this.email=user?.email ?? null;
   }

   async reenviarCorreoVerificacion(){
    this.message='';
    this.sending=true;

    try {
      const user=getAuth().currentUser;
      if(user && !user.emailVerified){
        await sendEmailVerification(user);
        this.message='Correo de verificación reenviado. Revisa tu bandeja de entrada o SPAM'
      }else{
        this.message='Tu correo ya está verificado o no hay usuario'
      }
    } catch (error:any) {
      this.message='Error al reenviar el correo de verificación: '+error.message;
    }finally{
      this.sending=false;
    }
   }

  ngOnInit() {
  }

}
