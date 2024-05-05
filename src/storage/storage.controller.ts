import {
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { S3 } from 'aws-sdk';
import { PrismaService } from 'src/prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';

@Controller('storage')
export class StorageController {
  constructor(private prismaService: PrismaService) {}
  private s3 = new S3();

  async uploadToAWS(file: Express.Multer.File) {
    // generate unique name
    const time = Date.now();
    const key = `${time}-${uuidv4()}-${file.originalname}`;
    const inputKey = `input/${key}`;
    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: inputKey,
      Body: file.buffer,
    };

    const result = await this.s3.upload(params).promise();
    const fileSize = file?.size;
    const name = file.originalname;
    const fileUrl = result.Location;
    const type = file.mimetype;

    const newFileDb = await this.prismaService.file.create({
      data: {
        name,
        type,
        size: fileSize,
        url: fileUrl,
      },
    });

    return { ...newFileDb };
  }

  @Post('upload')
  @UseInterceptors(FilesInterceptor('files', 5))
  async uploadFiles(@UploadedFiles() files: Express.Multer.File[]) {
    const promises = files.map((file) => this.uploadToAWS(file));
    const results = await Promise.all(promises);
    return {
      files: results,
    };
  }
}
