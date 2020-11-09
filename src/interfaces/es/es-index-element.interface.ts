import { ElementType } from '../site-element.interface';
import { ServeType } from '../cart-order-element-data.interface';
export enum EsElementPositionType {
    normal = "normal",
    plus = "plus"
}

export interface EsOptionsElement {
    name: string
    howMany: number
}

export interface EsDescElement {
    name: string
    howMany: number
}

export interface EsReverseElement {
    from: string
    to: string
    howMany: number
}

export interface EsPlusElement {
    id: number
}

export enum Weekdays {
    Monday = 1,
    Tuesday = 2,
    Wednesday = 3,
    Thursday = 4,
    Friday = 5,
    Saturday = 6,
    Sunday = 0
}

export enum WeekdaysPl {
    "Pon" = 1,
    "Wt" = 2,
    "Śr" = 3,
    "Czw" = 4,
    "Pt" = 5,
    "Sob" = 6,
    "Niedz" = 0
}

export interface EsIndexElement {
    id?: string
    oId: number
    oelId: number | null
    poelId: number | null
    melId: number | null
    index: number | null
    indString: string | null
    priceNameIndex: number | null
    configFirstIndex: number | null
    configSecondIndex: number | null
    configThirdIndex: number | null
    name: string
    cCId: number | null
    elementPositionType: EsElementPositionType
    elastic: boolean
    elementType: ElementType
    isSea: boolean
    hasGluten: boolean
    canGrill: boolean
    canPack: boolean
    canAcc: boolean
    canOnePlate: boolean
    canExtra: boolean
    onlyGrill: boolean
    onlyGluten: boolean
    gluten: number
    grill: number
    onOnePlate: boolean
    pricePerOne: number
    serveType: ServeType
    endAt: string
    startAt: string
    endDay: string
    weekDay: Weekdays
    hasPlus: boolean
    element: string
    description: string
    optionsElements: EsOptionsElement[]
    descElements: EsDescElement[]
    reverseElements: EsReverseElement[]
}