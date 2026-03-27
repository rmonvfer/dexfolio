import { SubscriptionType } from '@dexfolio/common/enums';

export interface SystemMessage {
  message: string;
  routerLink?: string[];
  targetGroups: SubscriptionType[];
}
