import { UserPerm } from './../interfaces/user.interface';
import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, CreateDateColumn, OneToMany, UpdateDateColumn } from "typeorm";
import * as moment from "moment"
import { CartOrder } from "./CartOrder";


@Entity()
export class User extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @OneToMany(type => CartOrder, cartOrder => cartOrder.user)
    cartOrders: CartOrder[]

    @Column({
        unique: true
    })
    nick: string

    @Column({
        length: 500
    })
    password: string


    @Column({ default: false })
    status: boolean

    @Column({
        type: 'enum',
        enum: [
            'superadmin', 'normal'
        ], default: 'normal'
    })
    permission: UserPerm

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