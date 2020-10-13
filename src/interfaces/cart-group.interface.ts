import { ElementConfigStepsPrice } from './menu-element.interface';
import { CartOrderElement } from './../entities/CartOrderElement';
import { MenuElement } from './../entities/MenuElement';
import { ServeType } from './cart-order-element-data.interface';
import { CartCategoryData } from './cart-category-data.interface';
import { CartCategory } from 'src/entities/CartCategory';
import { ElementType } from './site-element.interface';
import { AnchorData } from "./anchor-data.interface";

export interface StepPriceIndex {
    index: number,
    option: number
}

export interface StepOptionsListElement {
    configFirstIndex: number
    configSecondIndex: number
    configThirdIndex: number
    pricePerOne?: number
}

export interface AccType {
    name: string,
    icon: string
}

export interface AccElement {
    acc: AccType,
    howMany: number
}
export interface PlusElement {
    id?: number
    elementType: ElementType | string;
    ind?: { id: number; index: number | null, priceNameIndex: number | null, configFirstIndex: number | null, configSecondIndex: number | null, configThirdIndex: number | null };
    viewName?: string;
    shortName?: string;
    price: number;
    pricePerOne?: number
    qunatity?: number
    isSea?: boolean;
    canGrill?: boolean
    grill?: number
    hasGluten?: boolean
    gluten?: number
    optionsElements?: string[]
    reverseElements?: ReverseElement[];
    descElements?: string[];
    stepOptionsList?: StepOptionsListElement[] | null
    configStepsPrice?: ElementConfigStepsPrice[]
    description?: string;
}


export interface ReverseElement {
    from: string,
    to: string
}

export interface CartElementData {
    id?: number;
    docId?: string;
    specialInd?: number
    ind?: { id: number; index: number | null, priceNameIndex: number | null, configFirstIndex: number | null, configSecondIndex: number | null, configThirdIndex: number | null };
    elementType: ElementType | string;
    elastic?: boolean;
    isSea: boolean;
    quantity: number;
    element?: MenuElement;
    optionsElements?: string[];
    descElements?: string[];
    plusElements: PlusElement[];
    reverseElements: ReverseElement[];
    stepOptionsList: StepOptionsListElement[] | null
    viewName?: string;
    shortName?: string;
    price: number;
    pricePerOne?: number;
    description?: string;
    canExtra?: boolean
    extra?: number
    canGrill?: boolean
    onlyGrill?: boolean;
    grill?: number
    hasGluten?: boolean
    onlyGluten?: boolean;
    gluten?: number;
    canPack?: boolean
    type?: CartCategory;
    status?: boolean;
    serveType?: ServeType
    canAcc?: boolean
    acc?: AccElement[]
    onOnePlate?: boolean
    canOnePlate?: boolean
    cartCategory?: CartCategory
}


export interface CartGroup {
    type: AnchorData | CartCategoryData;
    elements: CartOrderElement[] | any[]
}
