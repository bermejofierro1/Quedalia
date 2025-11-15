import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { getAuth } from 'firebase/auth';

export const authGuard: CanActivateFn = (route, state) => {
 
 
  const router = inject(Router);
  const auth = getAuth();

  const user = auth.currentUser;

  if (user) {
    if (!user.emailVerified) {
      alert('Debes verificar tu correo antes de continuar.');
      router.navigate(['/verificar-correo']);
      return false;
    }
    return true;
  } else {
    router.navigate(['/login']);
    return false;
  }
};