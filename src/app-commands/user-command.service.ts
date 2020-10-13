import { UserPerm } from './../interfaces/user.interface';
import { Command, Console, createSpinner } from 'nestjs-console';
import { join } from 'path';
import * as fs from "fs"
import { map } from 'p-iteration';
import { User } from 'src/entities/User';
import { PasswordService } from 'src/services/password.service';

@Console()
export class UserCommandService {

    constructor(private passwordService: PasswordService) {

    }


    @Command({
        command: 'create-users'
    })
    async createUsers(): Promise<void> {

        const spin = createSpinner();
        spin.start('creating users');

        await this.createAdmin()

        spin.succeed('created')

    }


    async createAdmin() {

        // var admin = {
        //     nick: 'admin',
        //     password: await this.passwordService.getHash('kampiooshinek21'),
        //     status: true
        // }

        var admin = {
            nick: 'marc',
            password: await this.passwordService.getHash('super'),
            status: true,
            permission: UserPerm.super
        }

        await User.create(admin).save()

    }







}
