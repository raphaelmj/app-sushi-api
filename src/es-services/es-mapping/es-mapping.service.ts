import { Injectable } from '@nestjs/common';

@Injectable()
export class EsMappingService {
    flatMapping() {
        return {
            id: { "type": "keyword" },
            oId: { "type": "integer", "null_value": 0 },
            oelId: { "type": "integer", "null_value": 0 },
            poelId: { "type": "integer", "null_value": 0 },
            melId: { "type": "integer", "null_value": 0 },
            cCId: { "type": "integer", "null_value": 0 },
            indString: { "type": "keyword" },
            index: { "type": "integer" },
            priceNameIndex: { "type": "integer", "null_value": 0 },
            configFirstIndex: { "type": "integer", "null_value": 0 },
            configSecondIndex: { "type": "integer", "null_value": 0 },
            configThirdIndex: { "type": "integer", "null_value": 0 },
            name: { "type": "keyword" },
            elementPositionType: { "type": "keyword" }, //'normal','plus'
            elastic: { type: "boolean" },
            elementType: { "type": "keyword" }, //'many_names','one_name','desc_elements','config_price','special'
            isSea: { type: "boolean" },
            hasGluten: { type: "boolean" },
            canGrill: { type: "boolean" },
            canPack: { type: "boolean" },
            canAcc: { type: "boolean" },
            canOnePlate: { type: "boolean" },
            canExtra: { type: "boolean" },
            onlyGrill: { type: "boolean" },
            onlyGluten: { type: "boolean" },
            gluten: { "type": "integer" },
            grill: { "type": "double" },
            onOnePlate: { "type": "boolean" },
            pricePerOne: { "type": "double" },
            serveType: { "type": "keyword" }, //'pack', 'plate'
            endAt: { "type": "date", "format": "yyyy-MM-dd HH:mm:ss" },
            startAt: { "type": "date", "format": "yyyy-MM-dd HH:mm:ss" },
            endDay: { "type": "date", "format": "yyyy-MM-dd" },
            weekDay: { "type": "integer" },
            hasPlus: { type: "boolean" },
            element: { type: "text" },
            description: { type: "text" },
            optionsElements: {
                properties: {
                    name: { "type": "keyword" },
                    howMany: { "type": "integer" }
                }
            },
            descElements: {
                properties: {
                    name: { "type": "keyword" },
                    howMany: { "type": "integer" }
                }
            },
            reverseElements: {
                properties: {
                    from: { "type": "keyword" },
                    to: { "type": "keyword" },
                    howMany: { "type": "integer" }
                }
            }
        }
    }

    nestedMappings() {
        return {
            oId: { "type": "integer" },
            bonusUsed: { type: "boolean" },
            currentBonusPrice: { "type": "double" },
            currentBonusPercent: { "type": "double" },
            bonusType: { "type": "keyword" },
            oneExtraPrice: { "type": "double" },
            endAt: { "type": "date", "format": "yyyy-MM-dd HH:mm:ss" },
            startAt: { "type": "date", "format": "yyyy-MM-dd HH:mm:ss" },
            endDay: { "type": "date", "format": "yyyy-MM-dd" },
            weekDay: { "type": "integer" },
            total: { "type": "double" },
            bonusTotal: { "type": "double" },
            extra: { "type": "integer" },
            extraTotalPrice: { "type": "double" },
            elements: {
                type: "nested",
                properties: {
                    id: { "type": "keyword" },
                    oelId: { "type": "integer", "null_value": 0 },
                    poelId: { "type": "integer", "null_value": 0 },
                    melId: { "type": "integer", "null_value": 0 },
                    cCId: { "type": "integer", "null_value": 0 },
                    indString: { "type": "keyword" },
                    index: { "type": "integer", "null_value": 0 },
                    priceNameIndex: { "type": "integer", "null_value": 0 },
                    configFirstIndex: { "type": "integer", "null_value": 0 },
                    configSecondIndex: { "type": "integer", "null_value": 0 },
                    configThirdIndex: { "type": "integer", "null_value": 0 },
                    name: { "type": "keyword" },
                    elementPositionType: { "type": "keyword" },
                    elastic: { type: "boolean" },
                    elementType: { "type": "keyword" }, //'many_names','one_name','desc_elements','config_price','special'
                    isSea: { type: "boolean" },
                    hasGluten: { type: "boolean" },
                    canGrill: { type: "boolean" },
                    canPack: { type: "boolean" },
                    canAcc: { type: "boolean" },
                    canOnePlate: { type: "boolean" },
                    canExtra: { type: "boolean" },
                    onlyGrill: { type: "boolean" },
                    onlyGluten: { type: "boolean" },
                    gluten: { "type": "integer" },
                    grill: { "type": "double" },
                    pricePerOne: { "type": "double" },
                    quantity: { "type": "integer" },
                    hasPlus: { type: "boolean" },
                    serveType: { "type": "keyword" }, //'pack', 'plate'
                    element: { type: "text" },
                    description: { type: "text" },
                    optionsElements: {
                        properties: {
                            name: { "type": "keyword" },
                            howMany: { "type": "integer" }
                        }
                    },
                    descElements: {
                        properties: {
                            name: { "type": "keyword" },
                            howMany: { "type": "integer" }
                        }
                    },
                    reverseElements: {
                        properties: {
                            from: { "type": "keyword" },
                            to: { "type": "keyword" },
                            howMany: { "type": "integer" }
                        }
                    }
                }
            }
        }
    }
}
