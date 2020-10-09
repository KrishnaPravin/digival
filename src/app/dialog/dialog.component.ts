import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DialogData } from '../app.model';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.css'],
})
export class DialogComponent implements OnInit {
  startTime: number | string;
  endTime: number | string;
  hours = new Array(24).fill(0).map((_, i) => i);
  cost: boolean;

  constructor(
    public dialogRef: MatDialogRef<DialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}

  ngOnInit() {
    const slot = this.data.slots[this.data.slotNode.slotId];
    this.startTime = slot ? slot.start.getHours() : this.data.slotNode.hour;
    this.endTime = slot ? slot.end.getHours() : this.data.slotNode.hour + 3;
    this.cost = slot.cost;
  }

  close(): void {
    this.dialogRef.close();
  }

  save() {
    this.data.createSchedule(
      Number(this.startTime),
      Number(this.endTime),
      this.data.slotNode.datePosition,
      this.cost
    );
    this.dialogRef.close();
  }

  delete() {
    this.dialogRef.close();
    this.data.delete(this.data.slotNode);
  }
}
