export type CreateFileEvent = {
  sherryId: string
  fileType: string
  path: string
  size: number
  hash: string
};

export const isCreateFileEvent = (data: unknown): data is CreateFileEvent => {
  const event = data as CreateFileEvent;
  return !!(event.fileType && event.hash && event.size && event.path && event.sherryId);
};
