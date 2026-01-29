import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from "@angular/router";
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '@auth/services/auth.service';

@Component({
  selector: 'register-page',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './register-page.html',
})
export class RegisterPageComponent {
  fb = inject(FormBuilder)
  hasError = signal(false);
  isPosting = signal(false);
  router = inject(Router);

  AuthService = inject(AuthService);

  registerForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    fullName: ['', [Validators.required, Validators.minLength(3)]],

  });

  onSubmit() {
    if(this.registerForm.invalid) {
      this.hasError.set(true);
      setTimeout(() => {
        this.hasError.set(false);
      }, 2000);
      return;
    }

    const { email = '', password = '', fullName = ''} = this.registerForm.value;

    this.AuthService.register(email!, password!, fullName!).subscribe(isAuthenticated => {
      if(isAuthenticated) {
this.router.navigateByUrl('/')
return;
      }
      this.hasError.set(true);
      setTimeout(() => {
        this.hasError.set(false);
      }, 2000);
    });
  }
}
