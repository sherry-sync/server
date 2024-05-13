import { Injectable } from '@nestjs/common';

@Injectable()
export class FileService {
  async storeFile(file: { path: string; originalName: string; mimeType: string }) {
    console.log(file);
    // const { originalName } = file;
    // const filePath = `${__dirname}/../../../uploads/${originalName}`;
    //
    // const buffer = await util.promisify(fs.readFile)(file.path);

    // fs.writeFileSync(filePath, buffer);
  }
}
