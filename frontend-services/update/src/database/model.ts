import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class DeviceModel {
  @PrimaryColumn()
  id!: string;

  @Column({ nullable: true })
  name?: string;

  @Column({ nullable: true })
  current_version?: string;

  @Column({ nullable: true })
  target_version?: string;

  @Column({ nullable: true })
  target_url?: string;

  @Column({ nullable: true })
  last_contact?: Date;
}

export const Entities = [DeviceModel];
