import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class PasswordService {

    salt: number = 10;

    getHash(password: string): Promise<string> {

        return bcrypt.hash(password, this.salt)

    }

    comparePassword(password: string, hash: string): Promise<boolean> {
        return bcrypt.compare(password, hash)
    }
}
