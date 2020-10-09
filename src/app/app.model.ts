export type Slot = {
  start: Date;
  end: Date;
  scheduled: boolean;
  cost: boolean;
};

export type SlotsMap = { [key: string]: Slot };

export type SlotNode = {
  date: Date;
  datePosition: number;
  hour: number;
  slotId: string;
  color: string;
  showAdjustBar: boolean;
};

export type SlotRows = SlotNode[];

export type DialogData = {
  slots: SlotsMap;
  slotNode: SlotNode;
  createSchedule: (
    startTime: number,
    endTime: number,
    date: number,
    cost: boolean
  ) => void;
  delete: (node: SlotNode) => void;
};
