import { UserData } from "./user.interface";

export enum OrderStatus {
    create = 'create',
    ready = 'ready',
    archive = 'archive'
}


export enum OrderActionType {
    onSite = "onSite",
    takeAway = "takeAway",
    delivery = "delivery"
}


export enum OrderType {
    normal = "normal",
    special = "special"
}

export interface CartOrderData {
    id: number
    orderNumber: number | null
    endDay: any
    user: UserData
    total: number
    bonusTotal: number
    bonusUsed: boolean
    currentBonusPrice: number
    oneExtraPrice: number
    description: string | null
    forWho: string | null
    phone: string | null
    place: string
    status: OrderStatus
    inProgress: boolean
    paid?: boolean
    actionType: OrderActionType
    createType: OrderType
    cartOrderElements?: any[]
    groupElements?: Array<any>
    reservation?: boolean
    reservationSize?: number
    onOnePlate?: boolean
    startAt?: any
    endAt?: any
}
