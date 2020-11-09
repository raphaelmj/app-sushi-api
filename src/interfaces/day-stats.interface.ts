export interface BucketElement {
    names: string[]
    doc_count: number
    plate: number
    pack: number
}

export interface BonusCartData {
    ordersCount: number
    total: number
}

export interface BonusPercent {
    ordersCount: number
    total: number,
    details: Array<{ count: number, percent: number }>
}

export interface TotalServeTypes {
    plate: number
    pack: number
}

export interface DayStats {
    day: string
    total: number
    totalCount: number
    totalBonus: number
    extra: number
    extraPrice: number
    bonusCart: BonusCartData
    bonusPercent: BonusPercent
    totalServeTypes: TotalServeTypes
    bucketElements: BucketElement[]
}
