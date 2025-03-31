import { BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import { diskStorage } from 'multer';
import * as path from 'path';
import uuid from 'uuid';

export const fileUtils = {
  storage: (folder: string) =>
    diskStorage({
      destination: (req, file, cb) => {
        const path = `./public/uploads/${folder}`;
        fs.mkdirSync(path, { recursive: true });
        cb(null, path);
      },
      filename: (req, file, cb) => {
        const randomName = uuid.v4();
        const ext = path.extname(file.originalname);
        cb(null, `${randomName}${ext}`);
      },
    }),

  fileFilter: (allowedTypes: {
    mimeTypes: string[];
    fieldName: string;
    extensions: string[];
  }) => {
    return (req, file, cb) => {
      const isValidMime = allowedTypes.mimeTypes.includes(file.mimetype);
      const isValidExt = allowedTypes.extensions.some((ext) =>
        file.originalname.toLowerCase().endsWith(ext),
      );

      if (isValidMime && isValidExt) {
        cb(null, true);
      } else {
        cb(
          new BadRequestException(
            `Invalid file type for ${allowedTypes.fieldName}. ` +
              `Allowed types: ${allowedTypes.mimeTypes.join(', ')} ` +
              `(Extensions: ${allowedTypes.extensions.join(', ')})`,
          ),
          false,
        );
      }
    };
  },

  generateFileUrl: (file: Express.Multer.File, baseUrl: string) => {
    return `${baseUrl}${file.path.replace('public', '')}`;
  },
};
