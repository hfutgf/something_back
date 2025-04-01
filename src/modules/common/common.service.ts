import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';

@Injectable()
export class CommonService {
  async deleteFile(fileUrl: string) {
    try {
      const filePath = this.convertUrlToFilePath(fileUrl);

      await fs.access(filePath);

      await fs.unlink(filePath);
    } catch (error) {
      throw new InternalServerErrorException('File deletion failed: ', error);
    }
  }

  private convertUrlToFilePath(url: string): string {
    try {
      const urlObj = new URL(url);
      const relativePath = urlObj.pathname;
      return join(process.cwd(), 'public', relativePath);
    } catch (error) {
      throw new BadRequestException('Invalid file URL: ', error);
    }
  }
}
