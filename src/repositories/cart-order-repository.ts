import { EntityRepository, Repository } from 'typeorm';
import { CartOrder } from 'src/entities/CartOrder';

@EntityRepository(CartOrder)
export class CartOrderRepository extends Repository<CartOrder> {

}
