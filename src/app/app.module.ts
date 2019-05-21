import { NgModule } from '@angular/core';
import { BrowserModule, BrowserTransferStateModule, makeStateKey, TransferState } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import faFacebook from '@fortawesome/fontawesome-free-brands/faFacebook';
import faInstagram from '@fortawesome/fontawesome-free-brands/faInstagram';
import faTwitter from '@fortawesome/fontawesome-free-brands/faTwitter';
import faYoutube from '@fortawesome/fontawesome-free-brands/faYoutube';
import { library } from '@fortawesome/fontawesome-svg-core';
import { StorefrontModule, StorefrontSharedModule } from '@vendure/storefront';

import { AppComponent } from './app.component';
import { HomePageComponent } from './components/home-page/home-page.component';
import { routes } from './routing/app.routes';

const STATE_KEY = makeStateKey<any>('apollo.state');

@NgModule({
    declarations: [
        AppComponent,
        HomePageComponent,
    ],
    imports: [
        BrowserModule.withServerTransition({appId: 'serverApp'}),
        BrowserTransferStateModule,
        RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' }),
        StorefrontModule.forRoot({
            apolloOptions: {
                uri: 'http://localhost:3000/shop-api',
                withCredentials: true,
            },
        }),
        StorefrontSharedModule,
    ],
    bootstrap: [AppComponent],
})
export class AppModule {

    constructor(
        private storefrontModule: StorefrontModule,
        private readonly transferState: TransferState,
    ) {
        library.add(faTwitter, faFacebook, faInstagram, faYoutube);
        const isBrowser = this.transferState.hasKey<any>(STATE_KEY);

        if (isBrowser) {
            this.onBrowser();
        } else {
            this.onServer();
        }
    }

    onServer() {
        this.transferState.onSerialize(STATE_KEY, () => {
            const state = this.storefrontModule.extractState();
            return state;
        });
    }

    onBrowser() {
        const state = this.transferState.get<any>(STATE_KEY, null);
        this.storefrontModule.restoreState(state);
    }
}
