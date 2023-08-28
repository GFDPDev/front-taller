import { inject } from '@angular/core';
import { Router } from '@angular/router';


export const authGuard = () => {

  const router = inject(Router);
  const response = localStorage.getItem('token');
  if (response) {
    return true;
  }

  // Redirect to the login page
  return router.parseUrl('/notFound');
};
