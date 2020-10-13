import { ServeType } from './../interfaces/cart-order-element-data.interface';
import { OrderActionType } from './../interfaces/cart-order.interface';
import { ElementType } from './../interfaces/site-element.interface';
import { Entity, BaseEntity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Column, ManyToOne, OneToMany, ManyToMany, JoinTable } from "typeorm";
import * as moment from "moment"
import { CartOrder } from "./CartOrder";
import { MenuElement } from './MenuElement';

@Entity()
export class CartOrderElement extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;


    @ManyToOne(type => CartOrder, cart => cart.cartOrderElements, { onDelete: 'CASCADE' })
    cartOrder: CartOrder

    @ManyToOne(type => MenuElement, mel => mel.cartOrderElements, { onDelete: 'SET NULL' })
    menuElement: MenuElement

    @OneToMany((type) => MenuElement, (menuElement) => menuElement.cartOrderElements)
    elements: MenuElement[];

    @ManyToMany(type => MenuElement)
    @JoinTable({ name: 'menu_element_cart_element', joinColumn: { name: 'cartElementId', referencedColumnName: 'id' }, inverseJoinColumn: { name: 'menuElementId', referencedColumnName: 'id' } })
    menuElements?: MenuElement[];


    @Column({ type: "text", nullable: true })
    ind: string

    @Column({ type: "boolean", default: false })
    elastic: boolean

    @Column({
        type: 'enum',
        enum: [
            "many_names", "one_name", "desc_elements", "config_price", "config_steps_price", "config_steps_price_many", "special"
        ], default: 'special'
    })
    elementType: ElementType

    @Column({ default: false })
    isSea: boolean

    @Column({
        type: 'decimal',
        precision: 30,
        scale: 2,
        default: 0.00
    })
    price: number

    @Column({
        type: 'decimal',
        precision: 30,
        scale: 2,
        default: 0.00
    })
    pricePerOne: number

    @Column({
        nullable: true,
        type: 'text'
    })
    viewName: string

    @Column({
        nullable: true,
        type: 'varchar',
        length: 100
    })
    shortName: string

    @Column({
        default: 1
    })
    quantity: number

    @Column({
        type: "int", default: 0
    })
    gluten: number

    @Column({
        nullable: true,
        type: 'text'
    })
    description: string

    @Column({
        nullable: true
    })
    image: string

    @Column({ nullable: true, type: "text" })
    element: string

    @Column({ nullable: true, type: "text" })
    optionsElements: any

    @Column({ nullable: true, type: "text" })
    descElements: any

    @Column({ nullable: true, type: "text" })
    plusElements: any

    @Column({ nullable: true, type: "text" })
    reverseElements: any

    @Column({ nullable: true, type: "text" })
    stepOptionsList: any

    @Column({ default: true })
    canExtra: boolean

    @Column({ type: "int", default: 0 })
    extra: number

    @Column({ default: true })
    canGrill: boolean

    @Column({ default: false })
    onlyGrill: boolean

    @Column({
        type: 'decimal',
        precision: 5,
        scale: 1,
        default: 0.0
    })
    grill: number

    @Column({ default: false })
    hasGluten: boolean

    @Column({ default: false })
    onlyGluten: boolean

    @Column({ default: true })
    canPack: boolean

    @Column({ default: true })
    canAcc: boolean

    @Column({ nullable: true, type: "text" })
    acc: any

    @Column({ nullable: true, type: "text" })
    type: string

    @Column({ default: true })
    canOnePlate: boolean

    @Column({ default: true })
    onOnePlate: boolean

    @Column({
        type: 'enum',
        enum: [
            'pack', 'plate'
        ], default: 'plate'
    })
    serveType: ServeType

    @Column({ default: false })
    status: boolean

    @UpdateDateColumn({
        type: 'timestamp',
        precision: 0,
        default: () => 'CURRENT_TIMESTAMP(0)',
        update: true,
        transformer: {
            from: (value?: Date | null) =>
                value === undefined || value === null ? value : moment(value).toISOString(),
            to: (value?: string | null) =>
                value === undefined || value === null ? value : new Date(value)
        }
    })
    public updatedAt?: Date;

    @CreateDateColumn({
        type: 'timestamp',
        precision: 0,
        default: () => 'CURRENT_TIMESTAMP(0)',
        update: false,
        transformer: {
            from: (value?: Date | null) =>
                value === undefined || value === null ? value : moment(value).toISOString(),
            to: (value?: string | null) =>
                value === undefined || value === null ? value : new Date(value)
        }
    })
    public createdAt?: Date;

}
