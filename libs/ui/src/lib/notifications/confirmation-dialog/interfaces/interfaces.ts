import { ConfirmationDialogType } from '@dexfolio/common/enums';

export interface ConfirmDialogParams {
  confirmLabel: string;
  confirmType: ConfirmationDialogType;
  discardLabel: string;
  message?: string;
  title: string;
}
