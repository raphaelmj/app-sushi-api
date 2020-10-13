export enum UserRole {
  waiter = 'waiter',
  admin = 'admin',
}
export enum UserPerm {
  super = 'superadmin',
  normal = 'normal',
}
export interface UserData {
  id?: number;
  nick: string;
  role?: UserRole | string;
  permission?: UserPerm
}
