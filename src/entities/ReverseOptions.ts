import { Entity, BaseEntity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class ReverseOptions extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string

    @Column({ type: "text" })
    tags: any

    @Column({ nullable: true })
    ordering: number
}
