import { EventSubscriber, EntitySubscriberInterface, InsertEvent, UpdateEvent } from "typeorm";
import { DescOptions } from "../DescOptions";

@EventSubscriber()
export class DescOptionsSubscriber implements EntitySubscriberInterface<DescOptions> {
    listenTo() {
        return DescOptions;
    }


    afterLoad(entity: DescOptions) {

        if (entity.tags)
            entity.tags = JSON.parse(entity.tags)
    }

    afterInsert(event: InsertEvent<DescOptions>) {

        if (event.entity.tags)
            event.entity.tags = JSON.parse(event.entity.tags)
    }

    beforeInsert(event: InsertEvent<DescOptions>) {

        if (typeof event.entity.tags == 'object')
            event.entity.tags = JSON.stringify(event.entity.tags)

    }


    beforeUpdate(event: UpdateEvent<DescOptions>) {

        if (typeof event.entity.tags == 'object')
            event.entity.tags = JSON.stringify(event.entity.tags)

    }
}
