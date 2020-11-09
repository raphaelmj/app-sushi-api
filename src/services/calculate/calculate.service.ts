import { Injectable } from '@nestjs/common';
import BigNumber from "bignumber.js"

@Injectable()
export class CalculateService {

    constructor() { }

    multipleQuantity(quantity: string | number, pricePerOne: string | number): number {
        if (typeof quantity == 'string') {
            quantity = this.stringToNumber(quantity)
        }
        if (typeof pricePerOne == 'string') {
            pricePerOne = this.stringToNumber(pricePerOne)
        }
        var x = new BigNumber(quantity)
        return x.multipliedBy(pricePerOne).toNumber()
    }

    multipleValues(left: string | number, right: string | number): number {
        if (typeof left == 'string') {
            left = this.stringToNumber(left)
        }
        if (typeof right == 'string') {
            right = this.stringToNumber(right)
        }
        var x = new BigNumber(left)
        return x.multipliedBy(right).toNumber()
    }

    pricePlusMapElements(price: string | number, plusPrices: Array<string | number>): number {
        if (typeof price == 'string') {
            price = this.stringToNumber(price)
        }
        var x = new BigNumber(price)
        plusPrices.map((p: string | number) => {
            if (typeof p == 'string') {
                p = this.stringToNumber(p)
            }
            x = x.plus(p)
        })
        return x.toNumber()
    }

    minusElements(left: string | number, right: string | number): number {
        if (typeof left == 'string') {
            left = this.stringToNumber(left)
        }
        if (typeof right == 'string') {
            right = this.stringToNumber(right)
        }
        var x = new BigNumber(left)
        return x.minus(right).toNumber()
    }

    plusElements(left: string | number, right: string | number): number {
        if (typeof left == 'string') {
            left = this.stringToNumber(left)
        }
        if (typeof right == 'string') {
            right = this.stringToNumber(right)
        }
        var x = new BigNumber(left)
        return x.plus(right).toNumber()
    }

    divElements(left: string | number, right: string | number) {
        if (typeof left == 'string') {
            left = this.stringToNumber(left)
        }
        if (typeof right == 'string') {
            right = this.stringToNumber(right)
        }
        var x = new BigNumber(left)
        return x.dividedBy(right).toNumber()
    }

    percentFind(percent: string | number, value: string | number) {
        if (typeof percent == 'string') {
            percent = this.stringToNumber(percent)
        }
        if (typeof value == 'string') {
            value = this.stringToNumber(value)
        }
        var p = new BigNumber(percent)
        var pFloat: BigNumber = p.dividedBy(100)
        return pFloat.multipliedBy(value).toNumber()
    }

    stringToNumber(value: string | number): number {
        var bN: BigNumber = new BigNumber(value)
        return bN.toNumber()
    }


}
