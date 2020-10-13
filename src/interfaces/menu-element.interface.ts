import { ElementOptionType, ElementPriceName, ElementDesc, ElementPrice, MenuElementType } from "./site-element.interface";

export interface PriceTypeOption {
    name: string
    shortName: string
    price: string,
    isSea: boolean
}

export interface ElementConfigStepsPriceType {
    type: string,
    options: PriceTypeOption[]
}

export interface ElementConfigStepsPrice {
    name: string
    shortName: string
    types: ElementConfigStepsPriceType[]
}

export interface MenuElementData {
    id: number;
    _id: string;
    optionsOnInit: ElementOptionType,
    options: string[]
    elastic?: boolean
    elementType: MenuElementType;
    name: string;
    shortName: string
    hasNamePrefix: boolean;
    description: string;
    perSizeForAll: string;
    image: string;
    priceNames: ElementPriceName[];
    descElements: ElementDesc[];
    configStepsPrice: ElementConfigStepsPrice[]
    skipStepOne?: boolean
    price: ElementPrice[];
    hasGluten: boolean
    onlyGluten?: boolean;
    canGrill: boolean
    onlyGrill?: boolean;
    canExtra: boolean
    canPack: boolean
    canOnePlate: boolean
    canAcc: boolean
    showOnPlus: boolean
    ordering: number | null
}