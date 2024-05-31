import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('user')
export class UserEntity {
  @PrimaryColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  password: string;

  @Column({
    name: 'gmt_create',
  })
  gmtCreate: Date;

  @Column({
    name: 'gmt_modified',
  })
  gmtModified: Date;
}
