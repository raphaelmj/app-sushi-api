import { EntityRepository, Repository } from 'typeorm';
import { DescOptions } from 'src/entities/DescOptions';

@EntityRepository(DescOptions)
export class DescOptionsRepository extends Repository<DescOptions> {

}
