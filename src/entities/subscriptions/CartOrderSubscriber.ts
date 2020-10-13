import {EventSubscriber, EntitySubscriberInterface} from "typeorm";

@EventSubscriber()
export class CartOrderSubscriber implements EntitySubscriberInterface<any> {

}
