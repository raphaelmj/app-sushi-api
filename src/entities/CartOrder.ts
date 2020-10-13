import { OrderType } from './../interfaces/cart-order.interface';
import { Entity, BaseEntity, PrimaryGeneratedColumn, Column, UpdateDateColumn, CreateDateColumn, OneToMany, ManyToOne } from "typeorm";
import * as moment from "moment"
import { CartOrderElement } from "./CartOrderElement";
import { User } from "./User";
import { OrderStatus, OrderActionType } from "src/interfaces/cart-order.interface";

@Entity()
export class CartOrder extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @OneToMany(type => CartOrderElement, cartOrderElement => cartOrderElement.cartOrder)
    cartOrderElements: CartOrderElement[]

    @ManyToOne(type => User, user => user.cartOrders, { onDelete: 'SET NULL' })
    user: User

    @Column({
        type: "int", nullable: true
    })
    orderNumber: number

    @Column({ type: 'date' })
    endDay: Date;

    @Column({
        nullable: true,
        type: 'decimal',
        precision: 30,
        scale: 2,
        default: 0.00
    })
    total: number

    @Column({
        nullable: true,
        type: 'decimal',
        precision: 30,
        scale: 2,
        default: 0.00
    })
    bonusTotal: number

    @Column({ default: false })
    bonusUsed: boolean

    @Column({
        nullable: true,
        type: 'decimal',
        precision: 30,
        scale: 2,
        default: 0.00
    })
    currentBonusPrice: number

    @Column({
        nullable: true,
        type: 'decimal',
        precision: 30,
        scale: 2,
        default: 0.00
    })
    oneExtraPrice: number

    @Column({ nullable: true, type: "text" })
    description: string

    @Column({ nullable: true, length: 255 })
    forWho: string

    @Column({ nullable: true, length: 50 })
    phone: string

    @Column({ nullable: true, length: 255 })
    place: string

    @Column({
        type: 'enum',
        enum: [
            'create', 'ready', 'paid', 'archive'
        ], default: 'create'
    })
    status: OrderStatus

    @Column({ default: false })
    inProgress: boolean

    @Column({
        type: 'enum',
        enum: [
            'onSite', 'takeAway', 'delivery'
        ], default: 'onSite'
    })
    actionType: OrderActionType

    @Column({ default: false })
    paid: boolean

    @Column({
        type: 'enum',
        enum: [
            'normal', 'special'
        ], default: 'normal'
    })
    createType: OrderType

    @Column({ default: false })
    reservation: boolean

    @Column({ type: "int", default: 0 })
    reservationSize: number

    @Column({ default: false })
    onOnePlate: number

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
    public startAt?: Date;

    @CreateDateColumn({
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
    public endAt?: Date;

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
