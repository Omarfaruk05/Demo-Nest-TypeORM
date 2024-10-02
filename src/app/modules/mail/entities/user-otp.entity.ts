import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class UserOTP {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'int',
    nullable: false,
  })
  userId: number;

  @Column({
    type: 'varchar',
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
}
