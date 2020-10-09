import { Component, OnInit } from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import {
  DialogData,
  Slot,
  SlotColumns,
  SlotNode,
  SlotRows,
  SlotsMap,
} from './app.model';
import { DialogComponent } from './dialog/dialog.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  currentMonthInArabic: string;
  startDate: Date;
  daysList: [Date, string][];
  slotRows: SlotRows[];
  slotColumns: SlotColumns[];
  slots: SlotsMap = {
    a: {
      start: new Date('2020-10-12T05:00:00'),
      end: new Date('2020-10-12T08:00:00'),
      scheduled: false,
      cost: true,
    },
    b: {
      start: new Date('2020-10-15T10:00:00'),
      end: new Date('2020-10-15T13:00:00'),
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
    this.daysList = new Array(14).fill(0).map((_, i) => {
      const d = this.addDays(this.startDate, i);
      return [d, arabicFormatter.format(this.addDays(this.startDate, i))];
    });

    this.slotColumns = new Array(14).fill(0).map((_, datePosition) =>
      new Array(24).fill(0).map((_, hour) => {
        return {
          date: this.addDays(this.startDate, datePosition),
          datePosition,
          hour,
          color: 'white',
          slotId: null,
        };
      })
    );

    Object.entries(this.slots).forEach(([slotId, slot]) => {
      const datePosition = slot.start.getDate() - this.startDate.getDate();
      let startHour = slot.start.getHours();
      const endHour = slot.end.getHours();
      const restColor = slot.scheduled ? '#f89696' : '#e0e0e0';
      const bookingColor = slot.scheduled ? '#f40105' : '#3eb2ff';
      const rest = [startHour - 2, startHour - 1, endHour + 1, endHour + 2];
      rest.forEach((i) => {
        this.slotColumns[datePosition][i].color = restColor;
        this.slotColumns[datePosition][i].slotId = slotId;
      });
      while (startHour <= endHour) {
        this.slotColumns[datePosition][startHour].color = bookingColor;
        this.slotColumns[datePosition][startHour].slotId = slotId;
        startHour++;
      }
    });
  }

  addDays(date: Date, days: number): Date {
    return new Date(new Date(date).setDate(date.getDate() + days));
  }

  onClickSlotNode(node: SlotNode) {
    if (node.slotId) {
      this.dialog.closeAll();
      this.dialog.open(DialogComponent, {
        width: '320px',
        data: {
          slots: this.slots,
          slotNode: node,
          createSchedule: this.createSchedule.bind(this),
          delete: (node: SlotNode) => {
            delete this.slots[node.slotId];
            this.ngOnInit();
          },
        },
      });
    } else {
      this.createSchedule1(node);
    }
  }

  createSchedule1(node: SlotNode) {
    const id = String(new Date().getTime());
    const scheduleDate = this.addDays(this.startDate, node.datePosition);
    this.slots[id] = {
      start: new Date(scheduleDate.setHours(node.hour, 0, 0, 0)),
      end: new Date(scheduleDate.setHours(node.hour + 3, 0, 0, 0)),
      scheduled: false,
      cost: false,
    };
    this.ngOnInit();
  }

  createSchedule(
    startHour: number,
    endHour: number,
    datePosition: number,
    cost: boolean
  ) {
    const id = String(new Date().getTime());
    const scheduleDate = this.addDays(this.startDate, datePosition);
    this.slots[id] = {
      start: new Date(scheduleDate.setHours(startHour, 0, 0, 0)),
      end: new Date(scheduleDate.setHours(endHour, 0, 0, 0)),
      scheduled: false,
      cost,
    };
    this.ngOnInit();
  }

  onMouseOver() {
    console.log('mouse over');
  }
}
