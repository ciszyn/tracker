import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList, AngularFireObject } from '@angular/fire/compat/database';
import { Observable } from 'rxjs';
import { SavedActivity } from '../models/saved-activity';

@Injectable({
  providedIn: 'root'
})
export class TrackerService {

  private dbPath = "/tracker"

  activityRef: AngularFireObject<SavedActivity[]>;

  constructor(private db: AngularFireDatabase) {
    this.activityRef = db.object(this.dbPath);
  }

  public getActivities(): Observable<SavedActivity[] | null> {
    return this.activityRef.valueChanges();
  }

  public setActivities(activities: SavedActivity[]): any {
    this.activityRef.update(activities);
  }
}
