import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { debug } from 'console';
import { DialogData } from '../app.model';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.css'],
})
export class DialogComponent implements OnInit {
  hours = new Array(24).fill(0).map((_, i) => i);
  startTime: number | string;
  endTime: number | string;
  initialStartTime: number;
  initialEndTime: number;
  cost: boolean;

  constructor(
    public dialogRef: MatDialogRef<DialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}

  ngOnInit() {
    const slot = this.data.slots[this.data.slotNode.slotId];
    this.startTime = slot.start.getHours();
    this.initialStartTime = this.startTime;
    this.endTime = slot.end.getHours();
    this.initialEndTime = this.endTime;
    this.cost = slot.cost;
  }

  close(): void {
    this.dialogRef.close();
  }

  save() {
    if (Number(this.endTime) - Number(this.startTime) < 3)
      return alert('Minimum 3 hours required');
    if (this.startTime < 2 || this.endTime > 22)
      return alert('Either start or End is at the edge');
    if (
      this.data.edit(
        Number(this.startTime),
        Number(this.endTime),
        this.cost,
        this.data.slotNode.datePosition,
        this.data.slotNode.slotId
      )
    ) {
      this.dialogRef.close();
    } else {
      alert('Another slot exists for this interval');
    }
  }

  delete() {
    this.dialogRef.close();
    this.data.delete(this.data.slotNode);
  }
}
