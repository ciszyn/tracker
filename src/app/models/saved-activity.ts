import { Activity } from "./activity";

export class SavedActivity {
  public constructor(public name: string, public activities: Activity[], public tags: string[]) {}
}
