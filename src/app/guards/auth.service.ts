import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  user$: Observable<firebase.User | null>;

  constructor(private afAuth: AngularFireAuth) {
    this.user$ = afAuth.authState;
    this.afAuth.getRedirectResult().then((result) => {});
  }

  login(): Promise<void> {
    return this.afAuth
      .setPersistence(firebase.auth.Auth.Persistence.NONE)
      .then((res) =>
        this.afAuth.signInWithRedirect(new firebase.auth.GoogleAuthProvider())
      );
  }

  logout() {
    this.afAuth.signOut();
  }
}
