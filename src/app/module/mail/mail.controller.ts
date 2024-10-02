import { Body, Controller, Post } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';
import { MailService } from './mail.service';

@Controller('mail')
export class MailController {
  constructor() {}
}
