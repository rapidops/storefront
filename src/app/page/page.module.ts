import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import {PerfectScrollbarConfigInterface, PerfectScrollbarModule, PERFECT_SCROLLBAR_CONFIG} from 'ngx-perfect-scrollbar';

import {SharedModule} from '../shared/shared.module';


import { PageRoutingModule } from './page-routing.module';
import {PageComponent, SafeHtmlPipe} from './page/page.component';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true,
};
@NgModule({
  declarations: [PageComponent, SafeHtmlPipe],
  imports: [
    CommonModule,
    PageRoutingModule,
    PerfectScrollbarModule,
    SharedModule
  ],
  entryComponents: [],
  providers: [{
    provide: PERFECT_SCROLLBAR_CONFIG,
    useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
  }]
})
export class PageModule { }
