import { EntityRepository, Repository } from 'typeorm';
import { MenuCategory } from 'src/entities/MenuCategory';

@EntityRepository(MenuCategory)
export class MenuCategoryRepository extends Repository<MenuCategory> {}
