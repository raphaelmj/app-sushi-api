import { AppConfig } from '../AppConfig';
import { EventSubscriber, EntitySubscriberInterface, InsertEvent, UpdateEvent } from "typeorm";

@EventSubscriber()
export class AppConfigSubscriber implements EntitySubscriberInterface<any> {
    listenTo() {
        return AppConfig;
    }


    afterLoad(entity: AppConfig) {

        if (entity.data)
            entity.data = JSON.parse(entity.data)
    }

    afterInsert(event: InsertEvent<AppConfig>) {

        if (event.entity.data)
            event.entity.data = JSON.parse(event.entity.data)
    }

    beforeInsert(event: InsertEvent<AppConfig>) {

        if (typeof event.entity.data == 'object')
            event.entity.data = JSON.stringify(event.entity.data)

    }


    beforeUpdate(event: UpdateEvent<AppConfig>) {

        if (typeof event.entity.data == 'object')
            event.entity.data = JSON.stringify(event.entity.data)

    }
}
