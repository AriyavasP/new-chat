import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('Dialogs')
export class Dialogs {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  role: string;

  @Column()
  content: string;

  @CreateDateColumn({ type: 'timestamp' })
  createTime: Date;
}