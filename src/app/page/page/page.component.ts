import {
    Component,
    Injector,
    OnInit,
    Pipe,
    PipeTransform
} from '@angular/core';
import { createCustomElement } from '@angular/elements';
// import {createCustomElement} from '@angular/elements';
import {DomSanitizer, Title} from '@angular/platform-browser';
import {ActivatedRoute, Router} from '@angular/router';
import * as _ from 'lodash';

import {DummyProductListComponent} from '../../core/components/dummy-product-list/dummy-product-list.component';
import {PageService} from '../service/page.service';

declare let $ : any;

@Pipe({name: 'safeHtml'})
export class SafeHtmlPipe implements PipeTransform {
    constructor(private sanitized: DomSanitizer) {
    }

    transform(value: any) {
        return this.sanitized.bypassSecurityTrustHtml(value);
    }
}

@Component({
    selector: 'vsf-page',
    templateUrl: './page.component.html',
    styleUrls: ['./page.component.scss']
})

export class PageComponent implements OnInit {
    pagePermalink: string;
    pageContent: any;
    pageNotFound: boolean = false;
    allCampaigns: any = [];
    availableCampaigns: any = [];
    showLoader: boolean = false;
    selectedCampaign: any;
    storeId: string;
    displayTabletAdvertise: boolean = false;
    displayDesktopAdvertise: boolean = false;
    displayMobileAdvertise: boolean = false;
    pageName: string;
    private campaignIds: any;
    private campaignPermalink: string;
    pageTemplate: any;
    isMobile: false;

    constructor(injector: Injector, private activatedRoute: ActivatedRoute, private pageService: PageService,
                private titleService: Title, private router: Router) {
        // Create the custom element
        const customElement = customElements.get('hts-campaign');
        if (!customElement) {
            const campaignElement = createCustomElement(DummyProductListComponent, {injector: injector});
            // Register it in the elements registry of the browser => This is NOT an Angular API!
            customElements.define('hts-campaign', campaignElement);
        }

    }

    /**
     * @method ngOnInit
     * @description this function is used to initialize page details
     * @tickets HTDART-24111
     */
    ngOnInit() {
        this.showLoader = true;
        this.availableCampaigns = [];
        // this.storeId = this.storeService.getCurrentStore();
        this.storeId = '157';
        this.selectedCampaign = {id: '', name: ''};
        this.activatedRoute.paramMap.subscribe(params => {
            // @ts-ignore
            this.pagePermalink = params.get('permalink');
            this.getPageDetails(this.pagePermalink);
            this.selectedCampaign = {id: '', name: ''};

        });
        this.activatedRoute.queryParams.subscribe((parmas) => {
            this.campaignPermalink = parmas.campaignPermalink;
            if (!this.campaignPermalink) {
                this.selectedCampaign = {id: '', name: ''};
            }
        });
        this.campaignIds = [];
        // this.campaignService.campaignRegistered$.subscribe((id: string) => {
        //     this.availableCampaigns.push({'id': id});
        //     this.campaignIds.push(id);
        // });
        // this.campaignService.campaignLoaded$.subscribe((data: any) => {
        //     this.allCampaigns.push({'id': data._id, 'name': data.Name, 'permalink': data.PermaLink});
        //     const sortedDataBasedOnOrder = _.sortBy(this.allCampaigns, (campaign) => {
        //         return this.campaignIds.indexOf(campaign.id);
        //     });
        //     this.allCampaigns = sortedDataBasedOnOrder;
        //     this.campaignService.setPageName(this.pageName);
        //     if (this.campaignPermalink) {
        //         // this.campaignPermalink = null;
        //         const matchedPermalink = _.find(this.allCampaigns, {'permalink': this.campaignPermalink});
        //         if (matchedPermalink) {
        //             this.selectedCampaign = matchedPermalink;
        //             setTimeout(() => {
        //                 this.redirectToCampaign(this.selectedCampaign);
        //             }, 100);
        //         } else {
        //             this.selectedCampaign = {id: '', name: ''};
        //         }
        //     }
        // });
    }

    /**
     * @method getPageDetails
     * @param permalink
     * @description this function is used to get page details
     * @tickets HTDART-24111
     */
    getPageDetails(permalink: string) {
        this.pageService.getPageDetails(permalink).subscribe((response: any) => {
            if (response.Status === 'success') {
                if (response.Data.Status === 'Published' && response.Data.Body) {
                    this.pageName = response.Data.PageName;
                    this.pageTemplate = JSON.parse(response.Data.PageTemplates);
                    this.pageContent = response.Data.Body;
                    this.titleService.setTitle(`${response.Data.PageName}`);
                    this.showLoader = false;
                } else {
                    this.showLoader = false;
                    this.pageNotFound = true;
                }
            } else {
                this.showLoader = false;
                this.pageNotFound = true;
            }
        }, () => {
            this.showLoader = false;
            this.pageNotFound = true;
        });
    }

    /**
     * @method redirectToCampaign
     * @param campaign
     * @description this function is used to redirect to specific campaign portion
     * @tickets HTDART-24111
     */
    redirectToCampaign(campaign: any) {
        const selectedCampaign = $('#campaign-' + campaign.id);
        this.selectedCampaign = {id: '', name: ''};
        const topHeader = $('.main-header').height();
        const top = selectedCampaign.offset().top;
        const position = top - topHeader;
        window.scrollTo(0, position);
        this.selectedCampaign.id = campaign.id;
        this.selectedCampaign.name = campaign.name;
    }

    redirect() {
        this.selectedCampaign = {id: '', name: ''};
        this.router.navigate(['store', this.storeId, 'page', this.pagePermalink]);
    }
}
