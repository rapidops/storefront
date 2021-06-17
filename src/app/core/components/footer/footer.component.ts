import {Component} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {isPlatformBrowser} from '@angular/common';
import {Inject} from '@angular/core';
import {OnInit} from '@angular/core';
import {PLATFORM_ID} from '@angular/core';
import {ViewportScroller} from '@angular/common';

declare let $: any;

@Component({
    selector: 'vsf-footer',
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {

    constructor(private httpClient: HttpClient, @Inject(PLATFORM_ID) private _platformId: Object,
                private viewportScroller: ViewportScroller) {
    }

    footerData: any [];
    footerTextExpanded: any = false;

    ngOnInit() {
        this.getFooterData();
        if (isPlatformBrowser(this._platformId)) {
            $('body').on('click', '.footer_box h5', () => {
                if ($(window).width() < 768) {
                    $(this).parent().find('.footer-content').slideToggle();
                    $(this).toggleClass('active');
                }
            });
            window.addEventListener('orientationchange', () => {
                setTimeout(() => {
                    if (window.innerWidth > 768) {
                        $('.footer-content').css('display', 'block');
                    } else {
                        $('.footer-content').css('display', 'none');
                        $('footer .active').removeClass('active');
                    }
                }, 100);
            });
        }
    }

    getFooterData() {
        this.httpClient.get('https://storefront-dev.rapidretail.io/shop/api/menu').subscribe((data: any) => {
            this.footerData = data.Data;
        }, (err) => {
            // TODO handle error
            console.log('Error', err);
        });
    }

    goToTop() {
        this.viewportScroller.scrollToPosition([0, 0]); // scroll page to top position.
    }

}
