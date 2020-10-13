import { AppConfigData } from './../interfaces/app-config.interface';
import { Entity, BaseEntity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class AppConfig extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true, type: "text" })
    data: any | AppConfigData
}
