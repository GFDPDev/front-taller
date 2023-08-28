import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Convert } from 'src/app/interfaces/user';


export const adminGuard = () => {

  const router = inject(Router);
  const response = Convert.toUser(localStorage.getItem('user') ?? '');
  if (response.tipo == 1) {
    return true;
  }

  // Redirect to the login page
  return router.parseUrl('/notFound');
};
