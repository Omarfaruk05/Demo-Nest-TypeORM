import { forwardRef, Global, Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import { MailService } from './mail.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserOTP } from './entities/user-otp.entity';
import { MailController } from './mail.controller';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';

@Global()
@Module({
  imports: [
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        transport: {
          host: config.get('appConfig.mailHost'),
          secure: false,
          port: 2525,
          auth: {
            user: config.get('appConfig.smtpUserName'),
            pass: config.get('appConfig.smtpPassword'),
          },
        },
        default: {
          from: `My Blog <no-reply@nestjs-blog.com>`,
        },
        template: {
          dir: join(__dirname, 'templates'),
          adapter: new EjsAdapter({
            inlineCssEnabled: true,
          }),
          options: {
            strict: false,
          },
        },
      }),
    }),
    TypeOrmModule.forFeature([UserOTP]),
    forwardRef(() => AuthModule),
    forwardRef(() => UsersModule),
  ],
  providers: [MailService],
  exports: [MailService],
  controllers: [MailController],
})
export class MailModule {}
