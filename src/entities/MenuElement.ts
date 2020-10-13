import { CartOrderElement } from 'src/entities/CartOrderElement';
import { MenuCategory } from './MenuCategory';
import { CartCategory } from './CartCategory';
import { ManyToOne, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { Entity, BaseEntity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { MenuElementType } from 'src/interfaces/site-element.interface';

@Entity()
export class MenuElement extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne((type) => CartCategory, (cartCategory) => cartCategory.elements, {
    onDelete: 'SET NULL',
  })
  cartCategory: CartCategory;

  @ManyToOne((type) => MenuCategory, (menuCategory) => menuCategory.elements, {
    onDelete: 'SET NULL',
  })
  menuCategory: MenuCategory;

  @OneToMany((type) => CartOrderElement, (coe) => coe.menuElement)
  cartOrderElements: CartOrderElement[]


  @ManyToMany(type => CartOrderElement)
  @JoinTable({ name: 'menu_element_cart_element', joinColumn: { name: 'menuElementId', referencedColumnName: 'id' }, inverseJoinColumn: { name: 'cartElementId', referencedColumnName: 'id' } })
  cartOrderInjectElements: CartOrderElement[];
  // @JoinTable()
  //{ name: 'menuElement_cartElement', joinColumn: { name: 'menuElementId', referencedColumnName: 'id' }, inverseJoinColumn: { name: 'cartElementId', referencedColumnName: 'id' } }



  @Column({ unique: true, nullable: true })
  _id: string;

  @Column({
    type: 'enum',
    enum: ['none', 'select', 'custom', 'all'],
    default: 'none',
  })
  optionsOnInit: 'none' | 'select' | 'custom' | 'all';

  @Column({ type: 'text', nullable: true })
  options: any;

  @Column({ type: 'boolean', default: false })
  elastic: boolean;

  @Column({
    type: 'enum',
    enum: ['many_names', 'one_name', 'desc_elements', 'config_price', 'config_steps_price', 'config_steps_price_many'],
    default: 'one_name',
  })
  elementType: MenuElementType | string

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  shortName: string;

  @Column({ type: 'boolean', default: false })
  hasNamePrefix: boolean;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  perSizeForAll: string;

  @Column({ nullable: true })
  image: string;

  @Column({ type: 'text' })
  priceNames: any;

  @Column({ type: 'text' })
  descElements: any;

  @Column({ type: 'text' })
  price: any;

  @Column({ type: 'text', nullable: true })
  configStepsPrice: any;

  @Column({ default: false })
  skipStepOne: boolean

  @Column({ default: false })
  canGrill: boolean

  @Column({ default: false })
  onlyGrill: boolean

  @Column({ default: true })
  canExtra: boolean

  @Column({ default: true })
  canPack: boolean

  @Column({ default: true })
  canOnePlate: boolean

  @Column({ default: true })
  canAcc: boolean

  @Column({ default: false })
  hasGluten: boolean

  @Column({ default: false })
  onlyGluten: boolean

  @Column({ default: false })
  showOnPlus: boolean

  @Column({ nullable: true })
  ordering: number;
}
