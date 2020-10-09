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
};

export type SlotRows = SlotNode[];
export type SlotColumns = SlotNode[];

export type DialogData = {
  slots: SlotsMap;
  slotNode: SlotNode;
  edit: (
    startTime: number,
    endTime: number,
    cost: boolean,
    datePosition: number,
    slotId: string
  ) => boolean;
  delete: (node: SlotNode) => void;
};
