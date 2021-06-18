import {Component, Inject, OnDestroy, OnInit, PLATFORM_ID} from '@angular/core';
import {isPlatformBrowser} from '@angular/common';
import {Router} from '@angular/router';
import {StoreService} from '../../core/services/store.service';
import {HttpClient} from '@angular/common/http';
import {DeviceDetectorService} from 'ngx-device-detector';
import * as _ from 'lodash';

declare var $;
declare let ga;
@Component({
  selector: 'vsf-banner',
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.scss']
})
export class BannerComponent implements OnInit, OnDestroy {

  allBanners: any;
  banners: any;
  isMobile: boolean;
  isDesktop: boolean;
  storeId = this.storeService.getCurrentStore();
  isSliderApplied: boolean = false;
  constructor(@Inject(PLATFORM_ID) private _platformId: Object,
              private storeService: StoreService,
              private router: Router,
              private httpClient: HttpClient,
              private deviceDetectorService: DeviceDetectorService) {
  }

  ngOnInit() {
    this.isDesktop = this.deviceDetectorService.isDesktop();
    this.isMobile = this.deviceDetectorService.isMobile() || this.deviceDetectorService.isTablet();
    this.getBanners();
    this.callGAEventOnBannerView();
  }

  ngOnDestroy() {
    this.isSliderApplied = false;
  }

  getBanners() {
    this.storeService.getBanners(this.storeService.getCurrentStore()).subscribe((response: any) => {
      this.allBanners = response.Data;
      this.setBanners();
    }, (err) => {
      // TODO handle error
    });
  }

  redirectTo(banner, e) {
    e.preventDefault();
    if (banner.TrackEvent) {
      ga('send', 'event', {
        eventCategory: 'SF_home_banner',
        eventAction: 'click',
        eventLabel: banner.EventCampaignName || banner.BannerImageAltText,
        transport: 'beacon'
      });
    }
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
      return banner.Active && (this.isMobile ? banner.ShowInMobile : banner.ShowInDesktop);
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
            this.sendGAViewEvent(campaignName, bannerAltText);
          }
        }, 1000);

      });
    }
  }

  /**
   * @method callGAEventOnBannerView
   * @description This is used to capture the change event in slick slider and check condition for sending GA view banner event accordingly.
   */
  callGAEventOnBannerView() {
      const that = this;
      $('.home-slider').on('afterChange.slick', function(event, slick, currentSlide) {
        if (that.isSliderApplied &&  $(slick.$slides[currentSlide]).children().attr('data-track-event') === 'true') {
          const campaignName = $(slick.$slides[currentSlide]).children().attr('data-campaign-name');
          const bannerAltText = $(slick.$slides[currentSlide]).children().attr('alt');
          that.sendGAViewEvent(campaignName, bannerAltText);
        }
      });
  }

  /**
   * @method sendGAViewEvent
   * @description This is used to send GA Event
   * @param campaignName
   * @param bannerAltText
   */
  sendGAViewEvent(campaignName, bannerAltText) {
    if (ga) {
      ga('send', {
        hitType: 'event',
        eventCategory: 'SF_home_banner',
        eventAction: 'view',
        eventLabel: campaignName || bannerAltText
      });
    }
  }
}
