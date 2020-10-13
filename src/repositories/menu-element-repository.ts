import { EntityRepository, Repository } from 'typeorm';
import { MenuElement } from 'src/entities/MenuElement';

@EntityRepository(MenuElement)
export class MenuElementRepository extends Repository<MenuElement> {}
