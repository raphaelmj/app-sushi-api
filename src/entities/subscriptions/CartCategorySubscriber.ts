import { CartCategory } from 'src/entities/CartCategory';
import { EventSubscriber, EntitySubscriberInterface, InsertEvent, UpdateEvent } from "typeorm";

@EventSubscriber()
export class CartCategorySubscriber implements EntitySubscriberInterface<any> {
    listenTo() {
        return CartCategory;
    }


    afterLoad(entity: CartCategory) {


    }

    afterInsert(event: InsertEvent<CartCategory>) {


    }

    beforeInsert(event: InsertEvent<CartCategory>) {



    }


    beforeUpdate(event: UpdateEvent<CartCategory>) {


    }
}
