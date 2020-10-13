import { MenuElement } from './MenuElement';
import { OneToMany } from 'typeorm';
import { Column } from 'typeorm';
import { PrimaryGeneratedColumn } from 'typeorm';
import { Entity, BaseEntity } from 'typeorm';

@Entity()
export class MenuCategory extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToMany((type) => MenuElement, (menuElement) => menuElement.menuCategory)
  elements: MenuElement[] | any;

  @Column()
  name: string;

  @Column({ unique: true, nullable: true })
  alias: string;

  @Column({ nullable: true })
  fullName: string

  @Column({ nullable: true, length: 10 })
  bgColor: string

  @Column({ nullable: true, length: 10 })
  fontColor: string

  @Column({ nullable: true })
  ordering: number;
}
