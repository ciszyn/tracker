import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuardService {
  constructor(private auth: AuthService) {}

  canActivate(_route: any) {
    return this.auth.user$.pipe(
      map((user) => {
        if (user != null) return true;
        this.auth.login();
        return true;
      })
    );
  }
}
