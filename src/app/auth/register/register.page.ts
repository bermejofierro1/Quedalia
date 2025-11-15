import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone:false
})
export class RegisterPage implements OnInit {

 email = '';
  password = '';
  errorMsg = '';
  nombre='';
  showPassword=false;
  constructor(private authService: AuthService, private router: Router,private fb:FormBuilder) {}
  ngOnInit() {
    
   
  }

  register() {
      if (!this.authService.isEmailValid(this.email)) {
    this.errorMsg = 'El correo no es válido.';
    return;
  }

  if (!this.authService.isPasswordSecure(this.password)) {
    this.errorMsg = 'La contraseña debe tener mínimo 7 caracteres, con letras y números.';
    return;
  }


    this.authService.register(this.email, this.password,this.nombre)
      .then(() => this.router.navigate(['/verificar-correo']))
      .catch(err => this.errorMsg = err.message);
  }
}
