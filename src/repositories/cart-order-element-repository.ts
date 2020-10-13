import { EntityRepository, Repository } from 'typeorm';
import { CartOrderElement } from 'src/entities/CartOrderElement';

@EntityRepository(CartOrderElement)
export class CartOrderElementRepository extends Repository<CartOrderElement> {

}
