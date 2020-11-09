import { ServeType } from 'src/interfaces/cart-order-element-data.interface';
import { ElementType } from '../site-element.interface';
import { EsElementPositionType, EsOptionsElement, EsDescElement, EsReverseElement, Weekdays } from 'src/interfaces/es/es-index-element.interface';
import { BonusType } from 'src/interfaces/cart-order.interface';
export interface EsOrderNestedElement {
    id: string
    oelId: number
    poelId: number
    melId: number
    cCId: number
    indString: string
    index: number | null
    priceNameIndex: number | null
    configFirstIndex: number | null
    configSecondIndex: number | null
    configThirdIndex: number | null
    name: string
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
    pricePerOne: number
    quantity: number
    hasPlus: boolean
    serveType: ServeType
    element: string
    description: string
    optionsElements: EsOptionsElement[]
    descElements: EsDescElement[]
    reverseElements: EsReverseElement[]
}

export interface EsOrderDataElement {
    oId: number
    bonusUsed: boolean
    currentBonusPrice: number
    currentBonusPercent: number
    bonusType: BonusType
    oneExtraPrice: number
    endAt: string
    startAt: string
    endDay: string
    weekDay: Weekdays
    total: number
    bonusTotal: number
    extra: number
    extraTotalPrice: number
}

export interface EsOrderIndexElement extends EsOrderDataElement {
    // oId: number
    // bonusUsed: boolean
    // currentBonusPrice: number
    // currentBonusPercent: number
    // bonusType: BonusType
    // oneExtraPrice: number
    // endAt: string
    // startAt: string
    // endDay: string
    // weekDay: number
    // total: number
    // bonusTotal: number,
    elements: EsOrderNestedElement[]
}
