import { Component } from '@angular/core';

type Slot = {
  start: Date;
  end: Date;
  scheduled: boolean;
  cost: boolean;
};
// type SlotNode = {
//   date?: number;
//   hour?: number;
//   color: string;
// };

type SlotNode = {
  color: string;
  showAdjustBar: boolean;
};

type SlotRows = SlotNode[];

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  startDate: Date;
  daysList: Date[];
  slotRows: SlotRows[];
  slots: Slot[] = [
    {
      start: new Date('2020-10-09T05:00:00'),
      end: new Date('2020-10-09T08:00:00'),
      scheduled: false,
      cost: false,
    },
    {
      start: new Date('2020-10-11T10:00:00'),
      end: new Date('2020-10-11T13:00:00'),
      scheduled: true,
      cost: false,
    },
  ];
  slotMap: { [key: string]: SlotNode } = {};

  ngOnInit() {
    this.startDate = new Date();
    this.daysList = new Array(7)
      .fill(0)
      .map((_, i) => this.addDays(this.startDate, i));

    this.slotRows = new Array(24).fill(0).map(() =>
      new Array(7).fill(0).map(() => {
        return { color: 'white', showAdjustBar: false };
      })
    );
    this.slots.forEach((slot) => {
      let date = slot.start.getDate();
      while (date > 6) date -= 6;
      let startHour = slot.start.getHours();
      const endHour = slot.end.getHours();
      const restColor = slot.scheduled ? 'orange' : 'grey';
      const bookingColor = slot.scheduled ? 'red' : 'blue';

      this.slotRows[startHour - 2 - 1][date - 1].color = restColor;
      this.slotRows[startHour - 1 - 1][date - 1].color = restColor;
      this.slotRows[endHour + 1 - 1][date - 1].color = restColor;
      this.slotRows[endHour + 2 - 1][date - 1].color = restColor;
      if (!slot.scheduled) {
        this.slotRows[startHour - 1][date - 1].showAdjustBar = true;
        this.slotRows[endHour - 1][date - 1].showAdjustBar = true;
      }
      while (startHour <= endHour) {
        this.slotRows[startHour - 1][date - 1].color = bookingColor;
        startHour++;
      }
    });

    // new Array(24).fill(0).forEach((_, hourPosition) => {
    //   new Array(7).fill(0).forEach((_, dayPosition) => {
    //     const date = this.addDays(this.startDate, dayPosition);
    //     this.slotMap[`${date.getDate()}-${hourPosition}`] = { color: 'white' };
    //   });
    // });
    // this.slots.forEach((slot) => {
    //   const date = slot.start.getDate();
    //   let startHour = slot.start.getHours();
    //   const endHour = slot.end.getHours();
    //   if (startHour < 2)
    //     throw new Error(
    //       `Insufficient start rest for ${slot.start} - ${slot.end}`
    //     );
    //   if (endHour > 22)
    //     throw new Error(
    //       `Insufficient end rest for ${slot.start} - ${slot.end}`
    //     );
    //   if (endHour - startHour < 3)
    //     throw new Error(
    //       `Insufficient duration for ${slot.start} - ${slot.end}`
    //     );
    //   const restColor = slot.scheduled ? 'orange' : 'grey';
    //   const bookingColor = slot.scheduled ? 'red' : 'blue';
    //   this.slotMap[`${date}-${startHour - 2}`].color = restColor;
    //   this.slotMap[`${date}-${startHour - 1}`].color = restColor;
    //   this.slotMap[`${date}-${endHour + 1}`].color = restColor;
    //   this.slotMap[`${date}-${endHour + 2}`].color = restColor;
    //   while (startHour <= endHour) {
    //     this.slotMap[`${date}-${startHour}`].color = bookingColor;
    //     startHour++;
    //   }
    // });

    // this.slotRows =
    // this.slotRows = new Array(24).fill(0).map((_, hourPosition) => {
    //   return new Array(7).fill(0).map((_, dayPosition) => {
    //     const date = this.addDays(dayPosition);
    //     date.setHours(hourPosition, 0, 0, 0);
    //     return { date: date.getDate(), hour: date.getHours(), color: '' };
    //   });
    // });
  }

  addDays(date: Date, days: number): Date {
    return new Date(new Date(date).setDate(date.getDate() + days));
  }
}
