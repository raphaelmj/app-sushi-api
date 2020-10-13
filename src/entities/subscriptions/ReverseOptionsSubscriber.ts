import { EventSubscriber, EntitySubscriberInterface, InsertEvent, UpdateEvent } from "typeorm";
import { ReverseOptions } from "../ReverseOptions";

@EventSubscriber()
export class ReverseOptionsSubscriber implements EntitySubscriberInterface<ReverseOptions> {
    listenTo() {
        return ReverseOptions;
    }


    afterLoad(entity: ReverseOptions) {

        if (entity.tags)
            entity.tags = JSON.parse(entity.tags)
    }

    afterInsert(event: InsertEvent<ReverseOptions>) {

        if (event.entity.tags)
            event.entity.tags = JSON.parse(event.entity.tags)
    }

    beforeInsert(event: InsertEvent<ReverseOptions>) {

        if (typeof event.entity.tags == 'object')
            event.entity.tags = JSON.stringify(event.entity.tags)

    }


    beforeUpdate(event: UpdateEvent<ReverseOptions>) {

        if (typeof event.entity.tags == 'object')
            event.entity.tags = JSON.stringify(event.entity.tags)

    }
}
