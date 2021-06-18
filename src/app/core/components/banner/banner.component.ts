import {isPlatformBrowser} from '@angular/common';
import {HttpClient} from '@angular/common/http';
import {Component, Inject, OnDestroy, OnInit, PLATFORM_ID} from '@angular/core';
import {Router} from '@angular/router';
import * as _ from 'lodash';
declare var $: any;

@Component({
  selector: 'vsf-banner',
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.scss']
})
export class BannerComponent implements OnInit, OnDestroy {

  allBanners: any;
  banners: any;
  storeId : any = 157;
  isSliderApplied: boolean = false;
  constructor(@Inject(PLATFORM_ID) private _platformId: Object,
              private router: Router,
              private httpClient: HttpClient
  ) {
  }

  ngOnInit() {
    this.getBanners(this.storeId);
  }

  ngOnDestroy() {
    this.isSliderApplied = false;
  }

  // getBanners() {
  //   this.getBannersFromAdmin(this.storeId).subscribe((response: any) => {
  //     this.allBanners = response.Data;
  //     this.setBanners();
  //   }, (err) => {
  //     // TODO handle error
  //   });
  // }

    getBanners(storeId: any) {
        this.httpClient.get(`https://storefront-dev.rapidretail.io/api/banners?storeNumber=${storeId}`).subscribe((response: any) => {
            this.allBanners = response.Data;
            this.setBanners();
        }, (err) => {
            // TODO handle error
            console.log('Error', err);
        });
   }

  redirectTo(banner:any, e:any) {
    e.preventDefault();
    if (banner.ActionType === 'campaign') {
      if (banner.IsNewPageTarget) {
        const url = `/shop/store/${this.storeId}/campaign/${banner.SelectedCampaignPage.PermaLink}`;
        window.open(url, '_blank');
      } else {
        this.router.navigate(['store', this.storeId, 'campaign', banner.SelectedCampaignPage.PermaLink]);
      }
    } else if (banner.ActionType === 'url') {
      if (banner.BannerImageLink[0] !== '/' && banner.BannerImageLink.indexOf('http') !== 0) {
        banner.BannerImageLink = 'http://' + banner.BannerImageLink;
      }
      if (banner.IsNewPageTarget) {
        window.open(banner.BannerImageLink, '_blank');
      } else {
        window.location = banner.BannerImageLink;
      }
    }
  }

  setBanners() {
    this.banners = _.filter(this.allBanners, (banner) => {
      return banner.Active;
    });
    if (this.banners.length > 1) {
        this.applySlider();
    }
  }

  applySlider() {
    if (isPlatformBrowser(this._platformId)) {
      setTimeout(() => {
        $('.home-slider').slick({
          dots: true,
          autoplay: true,
          arrows: false,
          autoplaySpeed: 5000
        });
        this.isSliderApplied = true;
        // check for first slide and send view if track option is enable.
        const slick = $('.home-slider').slick('getSlick');
        const currentSlide = $('.home-slider').slick('slickCurrentSlide');
        setTimeout(() => {
          if ($(slick.$slides[currentSlide]).children().attr('data-track-event') === 'true') {
            const campaignName = $(slick.$slides[currentSlide]).children().attr('data-campaign-name');
            const bannerAltText = $(slick.$slides[currentSlide]).children().attr('alt');
          }
        }, 1000);

      });
    }
  }
}
