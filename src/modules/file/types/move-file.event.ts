export type MoveFileEvent = {
  sherryId: string
  path: string
  oldPath: string
};

export const isMoveFileEvent = (data: unknown): data is MoveFileEvent => {
  const event = data as MoveFileEvent;
  return !!(event.path && event.oldPath && event.sherryId);
};
