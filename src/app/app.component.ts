import { Component, HostListener, OnDestroy, TemplateRef } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { Observable, timer } from 'rxjs';
import { ComponentCanDeactivate } from './guards/can-deactivate';
import { Activity } from './models/activity';
import { SavedActivity } from './models/saved-activity';
import { TrackerService } from './services/tracker-service.service';
import 'chartjs-adapter-moment';

const counter = timer(0, 1000);

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements ComponentCanDeactivate {
  public activities: SavedActivity[] = [];
  public newActivity: SavedActivity = new SavedActivity("", []);
  public time: number = 0;
  public totalPieChart: any | null = null;
  public monthPieChart: any | null = null;
  public meanPieChart: any | null = null;
  public timeChart: any | null = null;
  public colors: string[] = []
  public activeActivity: SavedActivity | null = null;
  public selectedMenu: number = -1;
  public openedDialog: number = -1;

  constructor(private trackerService: TrackerService) {
    Chart.register(...registerables)

    trackerService.getActivities()?.subscribe(a => {
      this.activities = a ?? []

      this.activities.forEach((activity, index) => {
        if (this.isStarted(activity)) {
          this.activeActivity = activity;
        }
      })

      this.createPieChart("total")
      this.createPieChart("month")
      this.createPieChart("mean")
      this.createTimeChart()
    })


    counter.subscribe(t => this.time += 0);

    for (var i = 0; i < 16; i++) {
      this.colors.push(this.getRandomColor())
    }

    addEventListener('beforeunload', (event) => { confirm("confirm") });
  }

  @HostListener('window:beforeunload', ['$event'])
  canDeactivate(event: any): Observable<boolean> | boolean {
    confirm("confirm")

    if (this.activeActivity != null) {
      event.preventDefault();
      event.returnValue = '';
      return false;
    }

    return true;
  }

  public createNewActivity() {
    this.activities.push(this.newActivity);
    this.trackerService.setActivities(this.activities);
    this.newActivity = new SavedActivity("", []);
  }

  public updateActivities() {
    this.trackerService.setActivities(this.activities);
  }

  public startActivity(activity: SavedActivity, i: number) {
    console.log(this.activeActivity)

    if (activity.activities)
      activity.activities.push(new Activity(new Date(), null))
    else
      activity.activities = [new Activity(new Date(), null)]

    if (this.activeActivity != null) {
      this.activeActivity.activities[this.activeActivity.activities.length - 1].end = new Date()
    }

    this.activeActivity = activity;
    this.trackerService.setActivities(this.activities)
  }

  public stopActivity(activity: SavedActivity) {
    activity.activities[activity.activities.length - 1].end = new Date()
    this.activeActivity = null;
    this.trackerService.setActivities(this.activities)
  }

  public toggleActivity(activity: SavedActivity, i: number) {
    if (this.isStarted(activity)) {
      this.stopActivity(activity)
    }
    else {
      this.startActivity(activity, i)
    }
  }

  public deleteActivity(activity: SavedActivity, i: number) {
    this.activities.splice(i, 1);
    this.trackerService.deleteActivity(this.activities);

    if (this.activeActivity == activity) {
      this.activeActivity = null;
    }

    this.selectedMenu = -1;
    this.openedDialog= -1;
  }

  public clearActivity(activity: SavedActivity) {
    activity.activities = []
    this.trackerService.setActivities(this.activities)
  }

  public undoActivity(activity: SavedActivity) {
    activity.activities.pop()
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

  public getDurationByDay(activity: SavedActivity) {
    var map = new Map<string, number>();
    var result = <any[]>[]
    activity?.activities?.forEach(a => {
      var date = new Date(new Date(a.start).getFullYear(), new Date(a.start).getMonth(), new Date(a.start).getDate()).toISOString();
      map.set(date, (map.get(date) ?? 0) + this.getDuration(a))
    })

    console.log(map)

    map.forEach((value, key) => result.push({
      x: key,
      y: value
    }))

    return result
  }

  public getLastWeekDuration(activity: SavedActivity) {
    var result = 0
    if (!activity.activities)
      return 0;
    activity.activities.forEach(a => {
      if ((new Date().getTime() - 7 * 24 * 60 * 60 * 1000) < new Date(a.start).getTime())
        result += this.getDuration(a)
    })
    return result
  }

  public getLastMonthDuration(activity: SavedActivity) {
    var result = 0
    if (!activity.activities)
      return 0;
    activity.activities.forEach(a => {
      if ((new Date().getTime() - 30 * 7 * 24 * 60 * 60 * 1000) < new Date(a.start).getTime())
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
      if ((new Date().getTime() - 7 * 24 * 60 * 60 * 1000) < new Date(a.start).getTime())
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
    var color = '';
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
      if (type == "month")
        durations.push(this.getLastMonthDuration(a))
      if (type == "mean")
        durations.push(this.getMeanDuration(a))

      backgroundColors.push(this.colors[i % 16])

      labels.push(a.name)
    });

    var data = {
      labels: labels,
      datasets: [{
        data: durations,
      }]
    };

    if (type == "total") {
      this.totalPieChart?.destroy();
    }
    if (type == "month") {
      this.monthPieChart?.destroy();
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
          },
          legend: {
            labels: {
              color: "#bbb",
              font: {
                size: 15
              }
            }
          },
        }
      }
    });

    if (type == "total") {
      this.totalPieChart = chart
    }
    if (type == "month") {
      this.monthPieChart = chart
    }
    if (type == "mean") {
      this.meanPieChart = chart
    }
  }

  public createTimeChart() {
    this.timeChart?.destroy()

    var data = {
      labels: [1],
      datasets: <any[]>[]
    };

    this.activities.forEach(activity => {
      var durations = this.getDurationByDay(activity);
      console.log(durations)

      data.datasets.push({
        label: activity.name,
        data: durations
      })
    })

    var chartElement: any = document.getElementById('time-chart');

    this.timeChart = new Chart(chartElement, {
      type: 'line',
      data: data,
      options: {
        maintainAspectRatio: false,
        parsing: {
          xAxisKey: 'x',
          yAxisKey: 'y',
        },
        scales: {
          y: {
            min: 0,
            ticks: {
              color: "#bbb",
              font: {
                size: 15
              },
              callback: value => this.secondsToTimeString(parseFloat(value.toString()))
            }
          },
          x: {
            type: 'time',
            min: new Date().getTime() - 30 * 24 * 60 * 60 * 1000,
            time: {
              parser: "YYYY-MM-DDTHH:mm:ss",
              unit: "day"
            },
            ticks: {
              color: "#bbb",
              font: {
                size: 15
              }
            }
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: (value) => this.secondsToTimeString(parseFloat(value.parsed.y.toString()))
            }
          },
          legend: {
            title: {
              display: false,
            },
            labels: {
              color: "#bbb",
              font: {
                size: 15
              }
            }
          },
        },
      },
    });
  }

  public selectMenu(i: number) {
    console.log(i)
    if (this.selectedMenu === i) {
      this.selectedMenu = -1
      this.openedDialog = -1;
    }
    else {
      this.selectedMenu = i;
    }
  }

  public openDialog(i: number) {
    this.openedDialog = i;
  }

  public hideDialog() {
    this.openedDialog = -1;
  }

  public hideMenu() {
    this.selectedMenu = -1;
    this.openedDialog = -1;
  }
}
