import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DaySlotsList, DialogData, SlotNode, UserSlotsMap } from './app.model';
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

  loadSlotsGrid(): void {
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

  onClickSlotNode(node: SlotNode): void {
    if (node.slotId) {
      this.dialog.closeAll();
      this.dialog.open<DialogComponent, DialogData>(DialogComponent, {
        width: '320px',
        data: {
          slot: this.userSlotsMap[node.slotId],
          slotNode: node,
          edit: (
            startHour: number,
            endHour: number,
            slot: SlotNode,
            cost: boolean,
            repeat: boolean
          ) => {
            return this.editSchedule(startHour, endHour, slot, cost, repeat);
          },
          delete: (slotId: string) => this.deleteSchedule(slotId),
          checkRepeat: (
            startHour: number,
            endHour: number,
            fromDatePosition: number
          ) => this.checkRepeat(startHour, endHour, fromDatePosition),
        },
      });
    } else this.createSchedule(node);
  }

  createSchedule(node: SlotNode, skipLoad: boolean = false): void {
    if (!this.verifyMaxCountForADay(node))
      return alert('Max slots reached for the day');
    if (!this.verifySpace(node)) {
      return alert('Limited free space to squeeze in');
    }

    const id = new Date().getTime() + '-' + Math.floor(Math.random() * 100);
    const date = addDays(this.startDate, node.datePosition);
    this.userSlotsMap[id] = {
      start: new Date(date.setHours(node.hour, 0, 0, 0)),
      end: new Date(date.setHours(node.hour + MIN_STUDY_DURATION, 0, 0, 0)),
      scheduled: false,
      cost: false,
    };
    if (!skipLoad) this.loadSlotsGrid();
  }

  editSchedule(
    startHour: number,
    endHour: number,
    slot: SlotNode,
    cost?: boolean,
    repeat?: boolean
  ): boolean {
    if (!this.verifyOverlap(startHour, endHour, slot)) return false;

    this.userSlotsMap[slot.slotId].start.setHours(startHour);
    this.userSlotsMap[slot.slotId].end.setHours(endHour);
    if (cost !== undefined) this.userSlotsMap[slot.slotId].cost = cost;
    if (repeat) {
      let datePosition = slot.datePosition + 1;
      console.log(datePosition);

      while (datePosition < 14) {
        this.createSchedule(this.daySlotsList[datePosition++][startHour], true);
      }
    }
    this.loadSlotsGrid();
    return true;
  }

  deleteSchedule(slotId: string): void {
    delete this.userSlotsMap[slotId];
    this.loadSlotsGrid();
  }

  verifyMaxCountForADay(node: SlotNode): boolean {
    // A day can have max 2 bookings. Return true if no problem
    const dayList = this.daySlotsList[node.datePosition];
    const slots = new Set(dayList.filter((n) => n.slotId).map((n) => n.slotId));
    return slots.size < 2;
  }

  verifySpace(node: SlotNode): boolean {
    // Verify a new schedule with default timing can be fit into a day. Return true if no problem
    const selectedStartHour = node.hour;
    if (node.hour < 2 || node.hour > 19) return false;
    const dayList = this.daySlotsList[node.datePosition];
    const requiredEmptySlots = new Array(7)
      .fill(0)
      .map((_, i) => i + selectedStartHour - 2);
    if (requiredEmptySlots.some((i) => dayList[i].slotId)) return false;
    return true;
  }

  verifyOverlap(startHour: number, endHour: number, slot: SlotNode): boolean {
    // Verify no other slots overlap. Return true if no problem
    const dayList = this.daySlotsList[slot.datePosition];
    let startHourWithRest = startHour - 2;
    const endHourWithRest = endHour + 2;
    while (startHourWithRest < endHourWithRest) {
      if (
        dayList[startHourWithRest].slotId &&
        dayList[startHourWithRest].slotId !== slot.slotId
      )
        return false;
      startHourWithRest++;
    }
    return true;
  }

  checkRepeat(
    startHour: number,
    endHour: number,
    fromDatePosition: number
  ): boolean {
    while (fromDatePosition < 14) {
      const slotNodes = this.daySlotsList[fromDatePosition++];
      if (!this.verifyMaxCountForADay(slotNodes[startHour])) {
        return false;
      }

      let start = startHour;
      while (start <= endHour)
        if (slotNodes[start++].slotId) {
          return false;
        }
    }
    return true;
  }

  dragStart(event, slotNode: SlotNode): void {
    event.dataTransfer.setData('slotNode', JSON.stringify(slotNode));
  }

  allowDrop(event): void {
    event.preventDefault();
  }

  drop(event, newSlot: SlotNode): void {
    event.preventDefault();
    const oldSlot = JSON.parse(
      event.dataTransfer.getData('slotNode')
    ) as SlotNode;
    if (oldSlot.datePosition !== newSlot.datePosition) return;
    const userSlot = this.userSlotsMap[oldSlot.slotId];

    const [startHour, endHour] =
      userSlot.start.getHours() === oldSlot.hour
        ? [newSlot.hour, userSlot.end.getHours()]
        : [userSlot.start.getHours(), newSlot.hour + 1];

    if (endHour - startHour < 3) {
      return alert('Minimum 3 hours required');
    }
    if (startHour < 2 || endHour > 22) {
      return alert('Either start or End is at the edge');
    }

    if (!this.editSchedule(startHour, endHour, oldSlot))
      alert('Another slot exists in this interval');
  }
}

function addDays(date: Date, days: number): Date {
  return new Date(new Date(date).setDate(date.getDate() + days));
}
