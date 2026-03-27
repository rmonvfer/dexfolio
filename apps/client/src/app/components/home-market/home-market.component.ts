import { GfFearAndGreedIndexComponent } from '@dexfolio/client/components/fear-and-greed-index/fear-and-greed-index.component';
import { UserService } from '@dexfolio/client/services/user/user.service';
import { dexfolioFearAndGreedIndexSymbol } from '@dexfolio/common/config';
import { resetHours } from '@dexfolio/common/helper';
import {
  Benchmark,
  HistoricalDataItem,
  InfoItem,
  User
} from '@dexfolio/common/interfaces';
import { hasPermission, permissions } from '@dexfolio/common/permissions';
import { GfBenchmarkComponent } from '@dexfolio/ui/benchmark';
import { GfLineChartComponent } from '@dexfolio/ui/line-chart';
import { DataService } from '@dexfolio/ui/services';

import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  DestroyRef,
  OnInit
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DeviceDetectorService } from 'ngx-device-detector';

@Component({
  imports: [
    GfBenchmarkComponent,
    GfFearAndGreedIndexComponent,
    GfLineChartComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  selector: 'gf-home-market',
  styleUrls: ['./home-market.scss'],
  templateUrl: './home-market.html'
})
export class GfHomeMarketComponent implements OnInit {
  public benchmarks: Benchmark[];
  public deviceType: string;
  public fearAndGreedIndex: number;
  public fearLabel = $localize`Fear`;
  public greedLabel = $localize`Greed`;
  public hasPermissionToAccessFearAndGreedIndex: boolean;
  public historicalDataItems: HistoricalDataItem[];
  public info: InfoItem;
  public readonly numberOfDays = 365;
  public user: User;

  public constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private dataService: DataService,
    private destroyRef: DestroyRef,
    private deviceService: DeviceDetectorService,
    private userService: UserService
  ) {
    this.deviceType = this.deviceService.getDeviceInfo().deviceType;
    this.info = this.dataService.fetchInfo();

    this.userService.stateChanged
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((state) => {
        if (state?.user) {
          this.user = state.user;

          this.changeDetectorRef.markForCheck();
        }
      });
  }

  public ngOnInit() {
    this.hasPermissionToAccessFearAndGreedIndex = hasPermission(
      this.info?.globalPermissions,
      permissions.enableFearAndGreedIndex
    );

    if (this.hasPermissionToAccessFearAndGreedIndex) {
      this.dataService
        .fetchSymbolItem({
          dataSource: this.info.fearAndGreedDataSource,
          includeHistoricalData: this.numberOfDays,
          symbol: dexfolioFearAndGreedIndexSymbol
        })
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(({ historicalData, marketPrice }) => {
          this.fearAndGreedIndex = marketPrice;
          this.historicalDataItems = [
            ...historicalData,
            {
              date: resetHours(new Date()).toISOString(),
              value: marketPrice
            }
          ];

          this.changeDetectorRef.markForCheck();
        });
    }

    this.dataService
      .fetchBenchmarks()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(({ benchmarks }) => {
        this.benchmarks = benchmarks;

        this.changeDetectorRef.markForCheck();
      });
  }
}
