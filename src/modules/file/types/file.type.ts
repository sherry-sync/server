export type File = {
  path: string;
  originalname: string;
  mimeType: string;
  fieldname: string;
  buffer: Buffer;
  encoding: BufferEncoding
};
