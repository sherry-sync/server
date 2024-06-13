export type UpdateFileEvent = {
  sherryId: string
  path: string
  fileType?: string
  oldPath?: string
  size?: number
  hash?: string
};

export const isUpdateFileEvent = (data: unknown): data is UpdateFileEvent => {
  const event = data as UpdateFileEvent;
  return !!(event.path && event.sherryId
    && (event.fileType || event.hash || event.size || event.oldPath)
  );
};
