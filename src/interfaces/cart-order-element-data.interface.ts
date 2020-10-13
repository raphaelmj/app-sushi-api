import { CartCategoryData } from './cart-category-data.interface';
import { MenuElement } from './../entities/MenuElement';
import { OrderActionType } from './cart-order.interface';
import { MenuElementType, SiteElement } from "./site-element.interface";
import { PlusElement, ReverseElement } from "./cart-group.interface";

export enum ServeType {
    plate = "plate",
    pack = "pack"
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

export interface CartElementData {
    id?: number;
    docId?: string;
    specialInd?: number
    ind?: { id: number; index: number | null, priceNameIndex: number | null, configFirstIndex: number | null, configSecondIndex: number | null, configThirdIndex: number | null };
    elementType: MenuElementType | string;
    elastic?: boolean;
    isSea: boolean;
    quantity: number;
    element?: MenuElement;
    optionsElements?: string[];
    descElements?: string[];
    plusElements: PlusElement[];
    reverseElements: ReverseElement[];
    stepOptionsList?: StepOptionsListElement[] | null
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
    type?: CartCategoryData;
    status?: boolean;
    serveType?: ServeType
    canAcc?: boolean
    acc?: AccElement[]
    onOnePlate?: boolean
    canOnePlate?: boolean
    cartCategory?: CartCategoryData
}