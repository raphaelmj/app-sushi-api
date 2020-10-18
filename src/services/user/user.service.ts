import { UserData } from './../../interfaces/user.interface';
import { User } from './../../entities/User';
import { JwtService } from '@nestjs/jwt';
import { PasswordService } from './../password.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, Like } from 'typeorm';

@Injectable()
export class UserService {

    constructor(
        private passwordService: PasswordService,
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        private readonly jwtService: JwtService,
    ) { }


    async checkIsUserNameFreeExcept(id: number | null, nick: string): Promise<boolean> {
        if (id == null) {
            var c: number = await this.userRepository.count({ nick })
            return c == 0
        }
        var c: number = await this.userRepository.count({ id: Not(id), nick })
        return c == 0

    }

    async createUser(user: UserData): Promise<User | null> {
        var password = await this.passwordService.getHash(user.password)
        user.password = password
        var isFreeNick: boolean = await this.checkIsUserNameFreeExcept(null, user.nick)
        if (isFreeNick) {
            var u: User = await this.userRepository.create(user)
            return u
        }
        return null
    }

    async updateUser(user: UserData): Promise<User | null> {
        if (user.password.length > 0) {
            var password = await this.passwordService.getHash(user.password)
            user.password = password
        } else {
            var { password, ...rest } = user
            user = rest
        }
        var isFreeNick: boolean = await this.checkIsUserNameFreeExcept(user.id, user.nick)
        if (isFreeNick) {
            await this.userRepository.update(user.id, user)
            return await this.userRepository.findOne(user.id)
        }
        return null
    }


}
