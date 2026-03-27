import { SubscriptionType } from '@dexfolio/common/enums';
import { SubscriptionOffer, UserSettings } from '@dexfolio/common/interfaces';

import { Access, Account, Settings, User } from '@prisma/client';

// TODO: Compare with User interface
export type UserWithSettings = User & {
  accessesGet: Access[];
  accounts: Account[];
  activityCount: number;
  dataProviderdexfolioDailyRequests: number;
  permissions?: string[];
  settings: Settings & { settings: UserSettings };
  subscription?: {
    expiresAt?: Date;
    offer: SubscriptionOffer;
    type: SubscriptionType;
  };
};
