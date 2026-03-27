import { Activity, User } from '@dexfolio/common/interfaces';

import { Account } from '@prisma/client';

export interface CreateOrUpdateActivityDialogParams {
  accounts: Account[];
  activity: Activity;
  user: User;
}
