import { Component } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { timer } from 'rxjs';
import { Activity } from './models/activity';
import { SavedActivity } from './models/saved-activity';
import { TrackerService } from './services/tracker-service.service';

const counter = timer(0, 1000);

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public activities: SavedActivity[] = [];
  public newActivity: SavedActivity = new SavedActivity("", []);
  public time: number = 0;
  public totalPieChart: any | null = null;
  public weekPieChart: any | null = null;
  public meanPieChart: any | null = null;
  public colors: string[] = []

  constructor(private trackerService: TrackerService) {
    Chart.register(...registerables)

    trackerService.getActivities().subscribe(a => {
      this.activities = a ?? []

      this.createPieChart("total")
      this.createPieChart("week")
      this.createPieChart("mean")
    })

    counter.subscribe(t => this.time += 0);

    for (var i = 0; i < 16; i++) {
      this.colors.push(this.getRandomColor())
    }
  }

  public createNewActivity() {
    console.log("posting");
    this.activities.push(this.newActivity);
    this.trackerService.setActivities(this.activities);
    this.newActivity = new SavedActivity("", []);
  }

  public updateActivities() {
    console.log("updating")
    this.trackerService.setActivities(this.activities);
  }

  public startActivity(activity: SavedActivity) {
    console.log("starting")
    if (activity.activities)
      activity.activities.push(new Activity(new Date(), null))
    else
      activity.activities = [new Activity(new Date(), null)]
    this.trackerService.setActivities(this.activities)
    console.log(this.activities)
  }

  public stopActivity(activity: SavedActivity) {
    console.log("stopping")
    activity.activities[activity.activities.length - 1].end = new Date()
    this.trackerService.setActivities(this.activities)
  }

  public isStarted(activity: SavedActivity): boolean {
    if (!activity.activities || activity.activities.length == 0)
      return false
    return !activity.activities[activity.activities.length - 1].end
  }

  public getDuration(activity: Activity): number{
    if (activity.end == null){
      return Math.floor((new Date().getTime() - new Date(activity.start).getTime()) / 1000) + this.time;
    }
    return Math.floor((new Date(activity.end).getTime() - new Date(activity.start).getTime()) / 1000)
  }

  public getDurationByDay(activity: SavedActivity): Map<Date, number> {
    var map = new Map<Date, number>();
    activity.activities.forEach(a => {
      var date = new Date(a.start.getFullYear(), a.start.getMonth(), a.start.getDay());
      map.set(date, (map.get(date) ?? 0) + this.getDuration(a))
    })
    return map
  }

  public getLastWeekDuration(activity: SavedActivity) {
    var result = 0
    if (!activity.activities)
      return 0;
    activity.activities.forEach(a => {
      if ((new Date().getTime() - 7 * 60 * 60 * 1000) < new Date(a.start).getTime())
        result += this.getDuration(a)
    })
    return result
  }

  public getMeanDuration(activity: SavedActivity) {
    var result = 0
    var count = 0
    if (!activity.activities)
      return 0;
    activity.activities.forEach(a => {
      if ((new Date().getTime() - 7 * 60 * 60 * 1000) < new Date(a.start).getTime())
        result += this.getDuration(a)
        count += 1
    })
    return Math.floor(result / count)
  }

  public getTotalDuration(activity: SavedActivity): number {
    var result = 0
    if (!activity.activities)
      return 0;
    activity.activities.forEach(a => result += this.getDuration(a))
    return result
  }

  public getLastDuration(activity: SavedActivity): number {
    if (!activity.activities || activity.activities.length == 0)
      return 0
    return this.getDuration(activity.activities[activity.activities.length - 1])
  }

  public secondsToTimeString(s: number): string {
    var result = (s % 60) + "s";

    if (s >= 60)
      result = Math.floor((s / 60) % 60) + "m " + result

    if (s >= 3600)
      result = Math.floor((s / 3600) % 24) + "h "  + result

    if (s >= 3600 * 24)
      result = Math.floor(s / 3600 / 24) + "d " + result

    return result;
  }

  private getRandomColor() {
    var color = ''; // <-----------
    var letters = '0123456789ABCDEF';

    color += letters[Math.floor(Math.random() * 10 + 2)];
    color += letters[Math.floor(Math.random() * 16)];

    return '#' + color + color + color
  }

  public createPieChart(type: string) {
    var durations: number[] = []
    var backgroundColors: string[] = []
    var labels: string[] = []

    this.activities.forEach((a, i) => {
      if (type == "total")
        durations.push(this.getTotalDuration(a))
      if (type == "week")
        durations.push(this.getLastWeekDuration(a))
      if (type == "mean")
        durations.push(this.getMeanDuration(a))

      backgroundColors.push(this.colors[i % 16])

      labels.push(a.name)
    });

    var data = {
      labels: labels,
      datasets: [{
        data: durations,
        backgroundColor: backgroundColors
      }]
    };

    if (type == "total") {
      this.totalPieChart?.destroy();
    }
    if (type == "week") {
      this.weekPieChart?.destroy();
    }
    if (type == "mean") {
      this.meanPieChart?.destroy();
    }

    var element: any = document.getElementById(type + '-pie-chart');

    var chart = new Chart(element, {
      type: 'pie',
      data: data,
      options: {
        plugins: {
          tooltip: {
            callbacks: {
              label: (value) => this.secondsToTimeString(parseFloat(value.parsed.toString()))
            }
          }
        }
      }
    });

    if (type == "total") {
      this.totalPieChart = chart
    }
    if (type == "week") {
      this.weekPieChart = chart
    }
    if (type == "mean") {
      this.meanPieChart = chart
    }
  }
}
