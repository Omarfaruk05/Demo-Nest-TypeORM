import { Exclude } from 'class-transformer';
import { ENUM_ROLES } from 'src/app/common/enums/user.enum';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class UserOTP {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'number',
    nullable: false,
  })
  userId: number;

  @Column({
    type: 'string',
    length: 512,
    nullable: false,
  })
  otp: string;

  @CreateDateColumn()
  createDate: Date;

  @Column({
    type: 'datetime',
    nullable: false,
  })
  expiresAt: Date;

  @UpdateDateColumn()
  updateDate: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
