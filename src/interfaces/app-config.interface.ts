import { OrderStatus } from './cart-order.interface';
export interface ACElementConfig {
    name: string
    icon: string
}

export enum QueryStringState {
    none = "0",
    restrict = "1",
    all = "all"
}

export interface FilterState {
    sts: OrderStatus[],
    paid: QueryStringState,
    reservation: QueryStringState,
    inprogress: QueryStringState
}

export interface FilterStatesByRole {
    waiter: FilterState
    admin: FilterState
}

export interface AppConfigData {
    extraPrice: number,
    bonus: number,
    acc: ACElementConfig[]
    timezone: string
    lang: string
    bonusPercents: number[]
    inProgressMinutes: number
    defaultFiltersStates: FilterStatesByRole
}

export interface AppConfig {
    id: number
    data: AppConfigData
}