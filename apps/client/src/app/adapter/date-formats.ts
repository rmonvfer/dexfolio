import { DEFAULT_DATE_FORMAT_MONTH_YEAR } from '@dexfolio/common/config';
import { getDateFormatString } from '@dexfolio/common/helper';

export const DateFormats = {
  display: {
    dateInput: getDateFormatString(),
    monthYearLabel: DEFAULT_DATE_FORMAT_MONTH_YEAR,
    dateA11yLabel: getDateFormatString(),
    monthYearA11yLabel: DEFAULT_DATE_FORMAT_MONTH_YEAR
  },
  parse: {
    dateInput: getDateFormatString()
  }
};
