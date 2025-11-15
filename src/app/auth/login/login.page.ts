import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import {Keyboard} from '@capacitor/keyboard'
@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone:false
})
export class LoginPage {
 email = '';
  password = '';
  errorMsg = '';
  emailsGuardados: string[] = [];
emailsFiltrados: string[] = [];
tecladoAbierto=false;

  constructor(private authService: AuthService, private router: Router) {}
  ionViewWillEnter() {
    // Resetear campos al entrar a la página
    this.email = '';
    this.password = '';
    this.errorMsg = '';
  }

  ngOnInit() {
    
       Keyboard.addListener('keyboardWillShow', () => {
      this.tecladoAbierto = true;
    });
    Keyboard.addListener('keyboardWillHide', () => {
      this.tecladoAbierto = false;
    });
  
  this.emailsGuardados = JSON.parse(localStorage.getItem('emailsLogin') || '[]');
  this.emailsFiltrados = [...this.emailsGuardados]; // para mostrar todo inicialmente o vaciar
}

  login() {
     if (!this.email || !this.password) {
    this.errorMsg = 'Rellena todos los campos.';
    return;
  }
    this.authService.login(this.email, this.password)
      .then(() => {
      this.guardarEmailLocalStorage(this.email);
      this.router.navigate(['/tabs/grupos']); 
    })
      .catch(err => this.errorMsg = err.message);
  }
guardarEmailLocalStorage(email: string) {
  if (!email) return;

  let emailsGuardados: string[] = JSON.parse(localStorage.getItem('emailsLogin') || '[]');

  // Se añade si no existe ya 
  if (!emailsGuardados.includes(email)) {
    emailsGuardados.push(email);
    localStorage.setItem('emailsLogin', JSON.stringify(emailsGuardados));
  }
}

onEmailInput(event: any) {
  const valor = event.target.value.toLowerCase();
  if (!valor) {
    this.emailsFiltrados = [...this.emailsGuardados];
    return;
  }
  this.emailsFiltrados = this.emailsGuardados.filter(e => e.toLowerCase().includes(valor));
}

seleccionarEmail(email: string) {
  this.email = email;
  this.emailsFiltrados = [];
}

mostrarSugerencias = false;

onEmailFocus() {
  this.mostrarSugerencias = true;
  this.emailsFiltrados = [...this.emailsGuardados]; // mostrar todas inicialmente
}

onEmailBlur() {
  // Delay para permitir click en sugerencia antes de ocultar la lista
  setTimeout(() => {
    this.mostrarSugerencias = false;
  }, 150);
}


  
}
