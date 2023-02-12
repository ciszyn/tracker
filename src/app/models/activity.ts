import { Time } from "@angular/common";

export class Activity {
  constructor(public start: Date, public end: Date | null){}
}
