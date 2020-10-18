import { UserService } from './../../services/user/user.service';
import { User } from './../../entities/User';
import { AuthService } from 'src/services/auth.service';
import { Controller, Get, Param, Req, Res, Delete, Post, Body } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Controller('/api/auth-super')
export class AuthSuperController {

    constructor(
        private readonly authService: AuthService,
        private readonly userService: UserService,
        @InjectRepository(User) private readonly userRepository: Repository<User>
    ) { }

    @Get('get/all/users')
    async getAllUsers(@Req() req, @Res() res) {
        return res.json(await this.authService.getUsers())
    }

    @Delete('remove/user/:id')
    async removeUser(@Req() req, @Res() res, @Param() params) {
        return res.json(await this.userRepository.delete(params.id))
    }

    @Post('/is/nick/free/except')
    async isUserNameFree(@Req() req, @Res() res, @Body() body) {
        return res.json(await this.userService.checkIsUserNameFreeExcept(body.id, body.nick))
    }

    @Post('create/user')
    async createUser(@Req() req, @Res() res, @Body() body) {
        var user: User = await this.userService.createUser(body.user)
        if (user) {
            await user.save()
            var { password, ...rest } = user
            return res.json(rest)
        }
        return res.json(null)
    }


    @Post('update/user')
    async updateUser(@Req() req, @Res() res, @Body() body) {
        var user: User = await this.userService.updateUser(body.user)
        if (user) {
            var { password, ...rest } = user
            return res.json(rest)
        }
        return res.json(null)
    }


}
