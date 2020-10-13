import { MenuElement } from './MenuElement';
import { OneToMany } from 'typeorm';
import { Column } from 'typeorm';
import { Entity, PrimaryGeneratedColumn, BaseEntity } from 'typeorm';

@Entity()
export class CartCategory extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToMany((type) => MenuElement, (menuElement) => menuElement.cartCategory)
  elements: MenuElement[];

  @Column()
  name: string;

  @Column({ unique: true })
  alias: string;

  @Column({ nullable: true, length: 10 })
  bgColor: string

  @Column({ default: false })
  toPlus: boolean

  @Column({ default: false })
  isSpecial: boolean

  @Column({ nullable: true })
  ordering: number;
}
