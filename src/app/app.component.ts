import { Component, OnInit } from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { DialogData, Slot, SlotNode, SlotRows, SlotsMap } from './app.model';
import { DialogComponent } from './dialog/dialog.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  startDate: Date;
  daysList: Date[];
  slotRows: SlotRows[];
  slots: SlotsMap = {
    a: {
      start: new Date('2020-10-09T05:00:00'),
      end: new Date('2020-10-09T08:00:00'),
      scheduled: false,
      cost: false,
    },
    b: {
      start: new Date('2020-10-11T10:00:00'),
      end: new Date('2020-10-11T13:00:00'),
      scheduled: true,
      cost: false,
    },
  };
  // slotMap: { [key: string]: SlotNode } = {};

  constructor(public dialog: MatDialog) {}

  ngOnInit() {
    this.startDate = new Date();
    this.daysList = new Array(7)
      .fill(0)
      .map((_, i) => this.addDays(this.startDate, i));

    this.slotRows = new Array(24).fill(0).map((_, hour) =>
      new Array(7).fill(0).map((_, datePosition) => {
        return {
          date: this.addDays(this.startDate, datePosition),
          datePosition,
          hour,
          color: 'white',
          showAdjustBar: false,
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
      this.slotRows[startHour - 2][datePosition].color = restColor;
      this.slotRows[startHour - 2][datePosition].slotId = slotId;
      this.slotRows[startHour - 1][datePosition].color = restColor;
      this.slotRows[startHour - 1][datePosition].slotId = slotId;
      this.slotRows[endHour + 1][datePosition].color = restColor;
      this.slotRows[endHour + 1][datePosition].slotId = slotId;
      this.slotRows[endHour + 2][datePosition].color = restColor;
      this.slotRows[endHour + 2][datePosition].slotId = slotId;
      if (!slot.scheduled) {
        this.slotRows[startHour][datePosition].showAdjustBar = true;
        this.slotRows[endHour][datePosition].showAdjustBar = true;
      }
      while (startHour <= endHour) {
        this.slotRows[startHour][datePosition].color = bookingColor;
        this.slotRows[startHour][datePosition].slotId = slotId;
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
        width: '280px',
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
