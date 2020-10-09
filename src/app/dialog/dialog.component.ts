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

  constructor(
    public dialogRef: MatDialogRef<DialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}

  ngOnInit() {
    const slot = this.data.slots[this.data.slotNode.slotId];
    this.startTime = slot ? slot.start.getHours() : this.data.slotNode.hour;
    this.endTime = slot ? slot.end.getHours() : this.data.slotNode.hour + 3;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  save() {
    this.data.createSchedule(
      Number(this.startTime),
      Number(this.endTime),
      this.data.slotNode.datePosition,
      false
    );
    this.dialogRef.close();
  }
  delete() {
    this.data.delete(this.data.slotNode);
    this.dialogRef.close();
  }
}
