import { map } from 'p-iteration';
import { User } from './../entities/User';
import { UserData, UserTokenData, UserPerm } from './../interfaces/user.interface';
import { Injectable } from '@nestjs/common';
import { PasswordService } from './password.service';

import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private passwordService: PasswordService,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) { }

  async login(
    nick: string,
    password: string,
    role: string,
  ): Promise<{ success: boolean; access_token: string; user?: UserData }> {
    var u: User = await this.userRepository.findOne({ where: { nick, status: true } });

    if (u) {
      var compare = await this.passwordService.comparePassword(
        password,
        u.password,
      );
      if (compare) {
        const payload = { id: u.id, nick: u.nick, role, permission: u.permission };
        return {
          success: true,
          access_token: this.jwtService.sign(payload),
          user: { nick: u.nick, role, permission: u.permission },
        };
      } else {
        return { success: false, access_token: null };
      }
    } else {
      return { success: false, access_token: null };
    }
  }

  async loginApp(
    nick: string,
    password: string,
    role: string,
  ): Promise<{ success: boolean; access_token: string; user?: UserData, exp?: number }> {
    var u = await this.userRepository.findOne({ where: { nick, status: true } });

    if (u) {
      var compare: boolean = await this.passwordService.comparePassword(
        password,
        u.password,
      );

      // await this.jwtService.sign({ id: u.id, nick: u.nick, role })

      if (compare) {
        const payload = { id: u.id, nick: u.nick, role, permission: u.permission };
        var access_token = await this.jwtService.sign(payload);
        var t = await this.jwtService.verify<{}>(access_token);
        var user = { id: u.id, nick: u.nick, role, permission: u.permission }
        return {
          success: true,
          access_token,
          user,
          exp: t['exp']
        };
      } else {
        return { success: false, access_token: null };
      }
    } else {
      return { success: false, access_token: null };
    }
  }

  async checkAuth(cookies) {
    if (cookies.authToken) {
      try {
        this.jwtService.verify<{}>(cookies.authToken);
        return {
          success: true,
          user: this.jwtService.decode(cookies.authToken),
        };
      } catch (err) {
        return { success: false };
      }
    } else {
      return { success: false };
    }
  }

  async checkAuthApp(token: string): Promise<{ success: boolean, user?: any }> {
    // console.log(token)
    if (token) {
      try {
        this.jwtService.verify<{}>(token);
        return {
          success: true,
          user: this.jwtService.decode(token),
        };
      } catch (err) {
        return { success: false };
      }
    } else {
      return { success: false };
    }
  }

  async getFirstUser(): Promise<User> {
    return await this.userRepository.findOne({});
  }

  async checkSomePassword(password: string): Promise<boolean> {
    var bool = false
    var users: User[] = await this.userRepository.find()
    await map(users, async (u, i) => {
      if (await this.passwordService.comparePassword(password, u.password)) {
        bool = true
      }
    })
    return bool
  }

  async checkUserPassword(id: number, password: string): Promise<boolean> {
    var user: User = await this.userRepository.findOne(id)
    if (user) {
      return await this.passwordService.comparePassword(password, user.password)
    } else {
      return false
    }

  }

  async getCurrentUser(cookies): Promise<User | null> {
    return await this.userRepository.findOne({ select: ['id', 'nick', 'status', 'permission'], where: { id: 2 } })
    if (cookies.authToken) {
      try {
        this.jwtService.verify<{}>(cookies.authToken);
        var dt = this.jwtService.decode(cookies.authToken)
        return await this.userRepository.findOne({ select: ['id', 'nick', 'status', 'permission'], where: { id: dt['id'] } })
      } catch (err) {
        return null
      }
    } else {
      return null;
    }
  }

  async getCurrentUserToken(cookies): Promise<UserTokenData | null> {
    return {
      id: 2,
      nick: "marcin",
      role: "waiter",
      permission: UserPerm.super,
    }
    if (cookies.authToken) {
      try {
        this.jwtService.verify<{}>(cookies.authToken);
        var dt = this.jwtService.decode(cookies.authToken)
        return <UserTokenData>dt
      } catch (err) {
        return null
      }
    } else {
      return null;
    }
  }

  async getUsers() {
    return await this.userRepository.find({ select: ['id', 'nick', 'status', 'permission'] })
  }

}
