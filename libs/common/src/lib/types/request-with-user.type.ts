import { UserWithSettings } from '@dexfolio/common/types';

export type RequestWithUser = Request & { user: UserWithSettings };
