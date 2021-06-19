import { Route } from '@angular/router';
import {DummyProductListComponent} from './core/components/dummy-product-list/dummy-product-list.component';

import { ProductDetailComponent } from './core/components/product-detail/product-detail.component';
import { ProductListComponent } from './core/components/product-list/product-list.component';

export const routes: Route[] = [
    {
        path: 'category/:slug',
        component: ProductListComponent,
        pathMatch: 'full',
    },
    {
        path: 'search',
        component: ProductListComponent,
    },
    {
        path: 'product/:slug',
        component: ProductDetailComponent,
    },
    {
        path: 'account',
        loadChildren: () => import('./account/account.module').then(m => m.AccountModule),
    },
    {
        path: 'checkout',
        loadChildren: () => import('./checkout/checkout.module').then(m => m.CheckoutModule),
    },
    {
        path: 'shop/store/ds',
        loadChildren: () => import('./page/page.module').then(m => m.PageModule)
    },
    {
        path: 'test',
        component: DummyProductListComponent,
    },
];
