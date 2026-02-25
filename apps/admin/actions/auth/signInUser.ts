'use server';

import type { ServerActionResponse } from '@/types';
import {
  type SelectUser,
  database,
  eq,
  userPasswordTable,
  userTable,
} from '@repo/database';
import bcrypt from 'bcryptjs';

export async function signInUser(
  login: string,
  password: string
): ServerActionResponse<{
  isNotFound?: boolean;
  isPasswordNotMatch?: boolean;
  user?: SelectUser;
}> {
  try {
    // 1. 이메일로 유저 조회
    const [user] = await database
      .select()
      .from(userTable)
      .where(eq(userTable.login, login));

    if (!user) {
      return {
        ok: true,
        data: {
          isNotFound: true,
        },
      };
    }

    // 2. 유저 패스워드 조회
    const [userPassword] = await database
      .select()
      .from(userPasswordTable)
      .where(eq(userPasswordTable.userId, user.id));

    if (!userPassword) {
      return {
        ok: false,
      };
    }

    // 3. 비밀번호 비교
    const isMatch = await bcrypt.compare(password, userPassword.password);

    if (!isMatch) {
      return {
        ok: true,
        data: {
          isPasswordNotMatch: true,
        },
      };
    }

    return { ok: true, data: { user } };
  } catch (error) {
    console.error(error);
    return { ok: false };
  }
}
