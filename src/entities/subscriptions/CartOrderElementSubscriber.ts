import { EventSubscriber, EntitySubscriberInterface, InsertEvent, UpdateEvent } from "typeorm";
import { CartOrderElement } from "../CartOrderElement";

@EventSubscriber()
export class CartOrderElementSubscriber implements EntitySubscriberInterface<any> {
    listenTo() {
        return CartOrderElement;
    }

    afterLoad(entity: CartOrderElement) {

        if (entity.ind)
            entity.ind = JSON.parse(entity.ind)

        if (entity.element)
            entity.element = JSON.parse(entity.element)

        if (entity.type)
            entity.type = JSON.parse(entity.type)

        if (entity.descElements)
            entity.descElements = JSON.parse(entity.descElements)

        if (entity.plusElements)
            entity.plusElements = JSON.parse(entity.plusElements)

        if (entity.reverseElements)
            entity.reverseElements = JSON.parse(entity.reverseElements)

        if (entity.optionsElements)
            entity.optionsElements = JSON.parse(entity.optionsElements)

        if (entity.acc)
            entity.acc = JSON.parse(entity.acc)

        if (entity.stepOptionsList)
            entity.stepOptionsList = JSON.parse(entity.stepOptionsList)

    }

    afterInsert(event: InsertEvent<CartOrderElement>) {

        if (event.entity.ind)
            event.entity.ind = JSON.parse(event.entity.ind)

        if (event.entity.element)
            event.entity.element = JSON.parse(event.entity.element)

        if (event.entity.type)
            event.entity.type = JSON.parse(event.entity.type)

        if (event.entity.descElements)
            event.entity.descElements = JSON.parse(event.entity.descElements)

        if (event.entity.plusElements)
            event.entity.plusElements = JSON.parse(event.entity.plusElements)

        if (event.entity.reverseElements)
            event.entity.reverseElements = JSON.parse(event.entity.reverseElements)

        if (event.entity.optionsElements)
            event.entity.optionsElements = JSON.parse(event.entity.optionsElements)

        if (event.entity.acc)
            event.entity.acc = JSON.parse(event.entity.acc)

        if (event.entity.stepOptionsList)
            event.entity.stepOptionsList = JSON.parse(event.entity.stepOptionsList)

    }

    beforeInsert(event: InsertEvent<CartOrderElement>) {

        if (typeof event.entity.ind == 'object')
            event.entity.ind = JSON.stringify(event.entity.ind)

        if (typeof event.entity.element == 'object')
            event.entity.element = JSON.stringify(event.entity.element)

        if (typeof event.entity.type == 'object')
            event.entity.type = JSON.stringify(event.entity.type)

        if (typeof event.entity.descElements == 'object')
            event.entity.descElements = JSON.stringify(event.entity.descElements)

        if (typeof event.entity.plusElements == 'object')
            event.entity.plusElements = JSON.stringify(event.entity.plusElements)

        if (typeof event.entity.reverseElements == 'object')
            event.entity.reverseElements = JSON.stringify(event.entity.reverseElements)

        if (typeof event.entity.optionsElements == 'object')
            event.entity.optionsElements = JSON.stringify(event.entity.optionsElements)

        if (typeof event.entity.acc == 'object')
            event.entity.acc = JSON.stringify(event.entity.acc)

        if (typeof event.entity.stepOptionsList == 'object')
            event.entity.stepOptionsList = JSON.stringify(event.entity.stepOptionsList)

    }


    beforeUpdate(event: UpdateEvent<CartOrderElement>) {

        if (typeof event.entity.ind == 'object')
            event.entity.ind = JSON.stringify(event.entity.ind)

        if (typeof event.entity.element == 'object')
            event.entity.element = JSON.stringify(event.entity.element)

        if (typeof event.entity.type == 'object')
            event.entity.type = JSON.stringify(event.entity.type)

        if (typeof event.entity.descElements == 'object')
            event.entity.descElements = JSON.stringify(event.entity.descElements)

        if (typeof event.entity.plusElements == 'object')
            event.entity.plusElements = JSON.stringify(event.entity.plusElements)

        if (typeof event.entity.reverseElements == 'object')
            event.entity.reverseElements = JSON.stringify(event.entity.reverseElements)

        if (typeof event.entity.optionsElements == 'object')
            event.entity.optionsElements = JSON.stringify(event.entity.optionsElements)

        if (typeof event.entity.acc == 'object')
            event.entity.acc = JSON.stringify(event.entity.acc)

        if (typeof event.entity.stepOptionsList == 'object')
            event.entity.stepOptionsList = JSON.stringify(event.entity.stepOptionsList)
    }
}
