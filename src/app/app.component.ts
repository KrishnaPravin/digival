import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DaySlotsList, SlotNode, UserSlotsMap } from './app.model';
import { DialogComponent } from './dialog/dialog.component';

type DaysList = [Date, string][];
const MIN_STUDY_DURATION = 3;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  startDate: Date;
  currentMonthInArabic: string;
  daysList: DaysList;
  daySlotsList: DaySlotsList;
  userSlotsMap: UserSlotsMap = {
    // Will be from an API
    aaaa: {
      start: new Date('2020-10-15T05:00:00'),
      end: new Date('2020-10-15T08:00:00'),
      scheduled: false,
      cost: true,
    },
    bbbbb: {
      start: new Date('2020-10-19T10:00:00'),
      end: new Date('2020-10-19T13:00:00'),
      scheduled: true,
      cost: true,
    },
  };

  constructor(public dialog: MatDialog) {}

  ngOnInit() {
    this.startDate = new Date();
    this.currentMonthInArabic = new Intl.DateTimeFormat('en-TN-u-ca-islamic', {
      month: 'long',
      year: 'numeric',
    }).format(this.startDate);
    const arabicFormatter = new Intl.DateTimeFormat('en-TN-u-ca-islamic', {
      day: 'numeric',
    });

    // Generate 14 days (head date column)
    this.daysList = new Array(14).fill(null).map((_, datePosition) => {
      const d = addDays(this.startDate, datePosition);
      return [d, arabicFormatter.format(d)];
    });

    this.loadSlotsGrid();
  }

  loadSlotsGrid() {
    // Generate 14x24 empty slots to fill the view
    this.daySlotsList = new Array(14).fill(null).map((_, datePosition) =>
      new Array(24).fill(0).map((_, hour) => {
        return {
          date: addDays(this.startDate, datePosition),
          datePosition,
          hour,
          color: 'white',
          slotId: null,
        };
      })
    );

    Object.entries(this.userSlotsMap).forEach(([slotId, slot]) => {
      const datePosition = slot.start.getDate() - this.startDate.getDate();
      let startHour = slot.start.getHours();
      const endHour = slot.end.getHours();
      const [restColor, scheduleColor] = slot.scheduled
        ? ['#f89696', '#f40105']
        : ['#e0e0e0', '#3eb2ff'];
      const restHours = [startHour - 2, startHour - 1, endHour, endHour + 1];
      restHours.forEach((h) => {
        this.daySlotsList[datePosition][h].color = restColor;
        this.daySlotsList[datePosition][h].slotId = slotId;
      });
      while (startHour < endHour) {
        this.daySlotsList[datePosition][startHour].color = scheduleColor;
        this.daySlotsList[datePosition][startHour].slotId = slotId;
        startHour++;
      }
    });
  }

  onClickSlotNode(node: SlotNode) {
    if (node.slotId) {
      this.dialog.closeAll();
      this.dialog.open(DialogComponent, {
        width: '320px',
        data: {
          slot: this.userSlotsMap[node.slotId],
          slotNode: node,
          edit: this.editSchedule.bind(this),
          delete: this.deleteSchedule.bind(this),
        },
      });
    } else this.createSchedule(node);
  }

  createSchedule(node: SlotNode) {
    if (!this.verifyMaxCountForADay(node))
      return alert('Max slots reached for the day');
    if (!this.verifySpace(node))
      return alert('Limited free space to squeeze in');

    const id = String(new Date().getTime());
    const date = addDays(this.startDate, node.datePosition);
    this.userSlotsMap[id] = {
      start: new Date(date.setHours(node.hour, 0, 0, 0)),
      end: new Date(date.setHours(node.hour + MIN_STUDY_DURATION, 0, 0, 0)),
      scheduled: false,
      cost: false,
    };
    this.loadSlotsGrid();
  }

  editSchedule(
    startHour: number,
    endHour: number,
    cost: boolean,
    slot: SlotNode
  ) {
    if (!this.verifyOverlap(startHour, endHour, slot)) return false;

    this.userSlotsMap[slot.slotId].start.setHours(startHour);
    this.userSlotsMap[slot.slotId].end.setHours(endHour);
    this.userSlotsMap[slot.slotId].cost = cost;
    this.loadSlotsGrid();
    return true;
  }

  deleteSchedule(slotId: string) {
    delete this.userSlotsMap[slotId];
    this.loadSlotsGrid();
  }

  verifyMaxCountForADay(node: SlotNode): boolean {
    // A day can have max 2 bookings. Return true if no problem
    const todaysList = this.daySlotsList[node.datePosition];
    const slots = new Set(
      todaysList.filter((n) => n.slotId).map((n) => n.slotId)
    );
    return slots.size < 2;
  }

  verifySpace(node: SlotNode): boolean {
    // Verify a new schedule with default timing can be fit into a day. Return true if no problem
    const selectedStartHour = node.hour;
    if (node.hour < 2 || node.hour > 19) return false;
    const todaysList = this.daySlotsList[node.datePosition];
    const requiredEmptySlots = new Array(6)
      .fill(0)
      .map((_, i) => i + selectedStartHour - 2);
    if (requiredEmptySlots.some((i) => todaysList[i].slotId)) return false;
    return true;
  }

  verifyOverlap(startHour: number, endHour: number, slot: SlotNode): boolean {
    // Verify no other slots overlap. Return true if no problem
    const todaysList = this.daySlotsList[slot.datePosition];
    let startHourWithRest = startHour - 2;
    const endHourWithRest = endHour + 2;
    while (startHourWithRest < endHourWithRest) {
      if (
        todaysList[startHourWithRest].slotId &&
        todaysList[startHourWithRest].slotId !== slot.slotId
      )
        return false;
      startHourWithRest++;
    }
    return true;
  }
}

function addDays(date: Date, days: number): Date {
  return new Date(new Date(date).setDate(date.getDate() + days));
}
