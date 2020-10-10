export type SlotNode = {
  date: Date;
  datePosition: number;
  hour: number;
  slotId: string;
  color: string;
};

export type DaySlotsList = SlotNode[][];

export type Slot = {
  start: Date;
  end: Date;
  scheduled: boolean;
  cost: boolean;
};

export type UserSlotsMap = { [key: string]: Slot };

export type DialogData = {
  slot: Slot;
  slotNode: SlotNode;
  edit: (
    startTime: number,
    endTime: number,
    cost: boolean,
    slot: SlotNode
  ) => boolean;
  delete: (slotId: string) => void;
};
