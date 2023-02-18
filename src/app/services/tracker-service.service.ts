import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList, AngularFireObject } from '@angular/fire/compat/database';
import { Observable, map, switchMap } from 'rxjs';
import { AuthService } from '../guards/auth.service';
import { SavedActivity } from '../models/saved-activity';

@Injectable({
  providedIn: 'root'
})
export class TrackerService {

  private dbPath = "/tracker"

  activityRef: Observable<AngularFireObject<SavedActivity[]>>;

  constructor(private db: AngularFireDatabase, private auth: AuthService) {
    this.activityRef = this.auth.user$.pipe(map(user => db.object(user?.uid + this.dbPath)))
  }

  public getActivities(): Observable<SavedActivity[] | null> {
    return this.activityRef.pipe(switchMap(ref => ref.valueChanges()));
  }

  public setActivities(activities: SavedActivity[]): any {
    this.activityRef.subscribe(ref => ref.update(activities))
  }

  public deleteActivity(activities: SavedActivity[]) {
    // this.activityRef.subscribe(ref => ref.update(activities))
    this.activityRef.subscribe(ref => ref.set(activities))
  }
}
