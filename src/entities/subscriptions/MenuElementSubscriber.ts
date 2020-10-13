import { UpdateEvent } from 'typeorm';
import { InsertEvent } from 'typeorm';
import { MenuElement } from './../MenuElement';
import { EventSubscriber, EntitySubscriberInterface } from 'typeorm';

@EventSubscriber()
export class MenuElementSubscriber
  implements EntitySubscriberInterface<MenuElement> {
  listenTo() {
    return MenuElement;
  }

  afterLoad(entity: MenuElement) {
    if (entity.options) entity.options = JSON.parse(entity.options);
    if (entity.priceNames) entity.priceNames = JSON.parse(entity.priceNames);
    if (entity.descElements)
      entity.descElements = JSON.parse(entity.descElements);
    if (entity.price) entity.price = JSON.parse(entity.price);
    if (entity.configStepsPrice) entity.configStepsPrice = JSON.parse(entity.configStepsPrice);

  }

  afterInsert(event: InsertEvent<MenuElement>) {
    if (event.entity.options)
      event.entity.options = JSON.parse(event.entity.options);
    if (event.entity.priceNames)
      event.entity.priceNames = JSON.parse(event.entity.priceNames);
    if (event.entity.descElements)
      event.entity.descElements = JSON.parse(event.entity.descElements);
    if (event.entity.price) event.entity.price = JSON.parse(event.entity.price);
    if (event.entity.configStepsPrice) event.entity.configStepsPrice = JSON.parse(event.entity.configStepsPrice);

  }

  beforeInsert(event: InsertEvent<MenuElement>) {
    if (typeof event.entity.options == 'object')
      event.entity.options = JSON.stringify(event.entity.options);
    if (typeof event.entity.priceNames == 'object')
      event.entity.priceNames = JSON.stringify(event.entity.priceNames);
    if (typeof event.entity.descElements == 'object')
      event.entity.descElements = JSON.stringify(event.entity.descElements);
    if (typeof event.entity.price == 'object')
      event.entity.price = JSON.stringify(event.entity.price);
    if (typeof event.entity.configStepsPrice == 'object')
      event.entity.configStepsPrice = JSON.stringify(event.entity.configStepsPrice);

  }

  beforeUpdate(event: UpdateEvent<MenuElement>) {
    if (typeof event.entity.options == 'object')
      event.entity.options = JSON.stringify(event.entity.options);
    if (typeof event.entity.priceNames == 'object')
      event.entity.priceNames = JSON.stringify(event.entity.priceNames);
    if (typeof event.entity.descElements == 'object')
      event.entity.descElements = JSON.stringify(event.entity.descElements);
    if (typeof event.entity.price == 'object')
      event.entity.price = JSON.stringify(event.entity.price);
    if (typeof event.entity.configStepsPrice == 'object')
      event.entity.configStepsPrice = JSON.stringify(event.entity.configStepsPrice);
  }
}
