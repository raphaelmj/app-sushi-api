import { EntityRepository, Repository } from 'typeorm';
import { CartCategory } from 'src/entities/CartCategory';

@EntityRepository(CartCategory)
export class CartCategoryRepository extends Repository<CartCategory> {}
