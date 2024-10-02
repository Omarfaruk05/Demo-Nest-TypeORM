import { Exclude } from 'class-transformer';
import { ENUM_ROLES } from 'src/common/enums/user.enum';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 124,
    nullable: false,
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 96,
    nullable: false,
    unique: true,
  })
  email: string;

  @Column({
    type: 'varchar',
    length: 96,
    nullable: false,
  })
  @Exclude()
  password: string;

  @Column({
    type: 'enum',
    enum: ENUM_ROLES,
    nullable: true,
    default: ENUM_ROLES.USER,
  })
  role?: ENUM_ROLES;

  @Column({
    type: 'boolean',
    default: false,
    nullable: true,
  })
  isVerified?: boolean;

  @CreateDateColumn()
  createDate: Date;

  @UpdateDateColumn()
  updateDate: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
