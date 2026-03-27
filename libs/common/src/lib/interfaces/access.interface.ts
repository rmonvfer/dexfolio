import { AccessType } from '@dexfolio/common/types';

import { AccessPermission } from '@prisma/client';

export interface Access {
  alias?: string;
  grantee?: string;
  id: string;
  permissions: AccessPermission[];
  type: AccessType;
}
