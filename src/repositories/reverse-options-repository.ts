import { EntityRepository, Repository } from 'typeorm';
import { ReverseOptions } from 'src/entities/ReverseOptions';

@EntityRepository(ReverseOptions)
export class ReverseOptionsRepository extends Repository<ReverseOptions> {

}
