import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('authenticator')
export class AuthenticatorEntity {
  @PrimaryColumn()
  id: number;

  @Column({
    name: 'user_id',
  })
  userId: number;

  @Column({
    name: 'cred_id',
  })
  credId: string;

  @Column({
    name: 'public_key',
  })
  publicKey: string;

  @Column()
  type: string;

  @Column()
  transports: string;

  @Column()
  counter: number;

  @Column({
    name: 'gmt_create',
  })
  gmtCreate: Date;

  @Column({
    name: 'gmt_modified',
  })
  gmtModified: Date;
}
