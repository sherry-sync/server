// import * as fs from 'node:fs';
// import * as path from 'node:path';
//
// import { Injectable } from '@nestjs/common';
// import { File } from 'fastify-multer/lib/interfaces';
//
// @Injectable()
// export class FileRepository {
//   async saveFile(file: File): Promise<File> {
//     const filePath = path.join(path.dirname('.'), '..', 'uploads', file.filename);
//     const writeStream = fs.createWriteStream(filePath);
//     // eslint-disable-next-line no-param-reassign
//     file.path = filePath;
//
//     await new Promise((resolve, reject) => {
//       writeStream.on('finish', resolve);
//       writeStream.on('error', reject);
//       file.bufferStream.pipe(writeStream);
//     });
//
//     return file;
//   }
//
//   async loadFile(filename: string): Promise<any> {
//     const filePath = path.join(__dirname, '..', 'uploads', filename);
//
//     if (fs.existsSync(filePath)) {
//       const fileStats = fs.statSync(filePath);
//       return {
//         filename,
//         size: fileStats.size,
//         path: filePath,
//       };
//     }
//     throw new Error('File not found');
//   }
// }
