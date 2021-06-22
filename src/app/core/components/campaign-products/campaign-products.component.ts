import {Component, Input, OnInit} from '@angular/core';
import {DomSanitizer, SafeStyle, Title} from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import * as _ from 'lodash';
import { BehaviorSubject, combineLatest, merge, Observable, of } from 'rxjs';
import {
    distinctUntilChanged,
    exhaustMap,
    map,
    mapTo,
    scan,
    share,
    shareReplay,
    skip,
    switchMap,
    take,
    tap,
    withLatestFrom,
} from 'rxjs/operators';

import { GetCollection, SearchProducts } from '../../../common/generated-types';
import { getRouteArrayParam } from '../../../common/utils/get-route-array-param';
import { DataService } from '../../../core/providers/data/data.service';
import { StateService } from '../../../core/providers/state/state.service';
import { AssetPreviewPipe } from '../../../shared/pipes/asset-preview.pipe';

import { GET_COLLECTION, SEARCH_PRODUCTS } from './campaign-product-list.graphql';

@Component({
    selector: 'vsf-campaign-products',
    templateUrl: './campaign-products.component.html',
    styleUrls: ['./campaign-products.component.scss'],
})
export class CampaignProductsComponent implements OnInit {
    @Input() id: string;
    products$: Observable<SearchProducts.Items[]>;
    totalResults$: Observable<number>;
    collection$: Observable<GetCollection.Collection | undefined>;
    facetValues: SearchProducts.FacetValues[] | undefined;
    unfilteredTotalItems = 0;
    activeFacetValueIds$: Observable<string[]>;
    searchTerm$: Observable<string>;
    displayLoadMore$: Observable<boolean>;
    loading$: Observable<boolean>;
    breadcrumbs$: Observable<Array<{id: string; name: string; }>>;
    mastheadBackground$: Observable<SafeStyle>;
    private currentPage = 0;
    private refresh = new BehaviorSubject<void>(undefined);
    private campaignKeyValue = [{campaignId:'5d1e076c2ff1dc167de67565', collectionId:'2' , name:'Electronics Sale Fest', 'permalink': 'electronics-sale-fest'},
        {campaignId: '60c8a88b99c2b53f064f97c6', collectionId: '10', name:'Save Big on Footwear Products', permalink: 'save-big-on-footwear-products'},{
        campaignId: '60c899991130213aa0fc5083', collectionId:  '6', name: 'Super Furniture Sale', permalink:'super-furniture-sale'}];
    private collectionId : any;
    campaignName: string;
    totalProducts: any;
    private campaignPermaLink: string;
    readonly placeholderProducts = Array.from({ length: 12 }).map(() => null);

    constructor(private dataService: DataService,
                private route: ActivatedRoute,
                private stateService: StateService,
                private sanitizer: DomSanitizer,
                private titleService: Title) { }

    ngOnInit() {
        const perPage = 24;
        this.route.params.subscribe((urlParams) => {
            this.campaignPermaLink = urlParams.permalink;
            // this.from = this.activatedRoute.snapshot.queryParamMap.get('from');
        });
        const campaignObj: any = _.find(this.campaignKeyValue, {permalink: this.campaignPermaLink});
        // TODO need to set campaign id and permalink before demo
        if(!campaignObj) {
            this.collectionId = '1282918'; // for display no products found
        } else {
            this.collectionId = campaignObj.collectionId;
            this.campaignName = campaignObj.name;
            this.titleService.setTitle(`Product List : ${this.campaignName}`);
        }

        const collectionSlug$ = this.route.paramMap.pipe(
            map(pm => pm.get('slug')),
            distinctUntilChanged(),
            tap(slug => {
                this.stateService.setState('lastCollectionSlug', slug || null);
                this.currentPage = 0;
            }),
            shareReplay(1),
        );

        this.activeFacetValueIds$ = this.route.paramMap.pipe(
            map(pm => getRouteArrayParam(pm, 'facets')),
            distinctUntilChanged((x, y) => x.toString() === y.toString()),
            tap(() => {
                this.currentPage = 0;
            }),
            shareReplay(1),
        );
        this.searchTerm$ = this.route.queryParamMap.pipe(
            map(pm => pm.get('search') || ''),
            distinctUntilChanged(),
            shareReplay(1),
        );
        this.collection$ = collectionSlug$.pipe(
            switchMap(slug => {
                if (slug) {
                    return this.dataService.query<GetCollection.Query, GetCollection.Variables>(GET_COLLECTION, {
                        slug,
                    }).pipe(
                        map(data => data.collection),
                    );
                } else {
                    return of(undefined);
                }
            }),
            shareReplay(1),
        );


        const assetPreviewPipe = new AssetPreviewPipe();

        this.mastheadBackground$ = this.collection$.pipe(
            map(c => 'url(' + assetPreviewPipe.transform(c?.featuredAsset || undefined, 1000, 300) + ')'),
            map(style => this.sanitizer.bypassSecurityTrustStyle(style)),
        );

        this.breadcrumbs$ = this.collection$.pipe(
            map(collection => {
                if (collection) {
                    return collection.breadcrumbs;
                } else {
                    // return [{
                    //     id: '',
                    //     name: 'Home',
                    // }, {
                    //     id: '',
                    //     name: this.campaignName,
                    // }];
                    const defaultBredcrumbs = [];
                    defaultBredcrumbs.push({id: '', name:'Home'});
                    if(this.campaignName) {
                        defaultBredcrumbs.push({id:'', name:this.campaignName});
                    }
                    return  defaultBredcrumbs;
                }
            }),
        );

        const triggerFetch$ = combineLatest(this.collection$, this.activeFacetValueIds$, this.searchTerm$, this.refresh);
        const getInitialFacetValueIds = () => {
            combineLatest(this.collection$, this.searchTerm$).pipe(
                take(1),
                switchMap(([collection, term]) => {
                    return this.dataService.query<SearchProducts.Query, SearchProducts.Variables>(SEARCH_PRODUCTS, {
                        input: {
                            term,
                            groupByProduct: true,
                            collectionId: collection?.id,
                            take: perPage,
                            skip: this.currentPage * perPage,
                        },
                    });
                }),
            ).subscribe(data => {
                this.facetValues = data.search.facetValues;
                this.unfilteredTotalItems = data.search.totalItems;
            });
        };
        this.loading$ = merge(
            triggerFetch$.pipe(mapTo(true)),
        );
        const queryResult$ = triggerFetch$.pipe(
            switchMap(([collection, facetValueIds, term]) => {
                return this.dataService.query<SearchProducts.Query, SearchProducts.Variables>(SEARCH_PRODUCTS, {
                    input: {
                        term,
                        groupByProduct: true,
                        collectionId: this.collectionId,
                        facetValueIds,
                        take: perPage,
                        skip: this.currentPage * perPage,
                    },
                }).pipe(
                    tap(data => {
                        if (facetValueIds.length === 0) {
                            this.facetValues = data.search.facetValues;
                            this.unfilteredTotalItems = data.search.totalItems;
                        } else if (!this.facetValues) {
                            getInitialFacetValueIds();
                        } else {
                            this.facetValues = this.facetValues.map(fv => fv);
                        }
                    }),
                );
            }),
            shareReplay(1),
        );

        this.loading$ = merge(
            triggerFetch$.pipe(mapTo(true)),
            queryResult$.pipe(mapTo(false)),
        );

        const RESET = 'RESET';
        const items$ = this.products$ = queryResult$.pipe(map(data => data.search.items));
        const reset$ = merge(collectionSlug$, this.activeFacetValueIds$, this.searchTerm$).pipe(
            mapTo(RESET),
            skip(1),
            share(),
        );
        this.products$ = merge(items$, reset$).pipe(
            scan<SearchProducts.Items[] | string, SearchProducts.Items[]>((acc, val) => {
                if (typeof val === 'string') {
                    return [];
                } else {
                    return acc.concat(val);
                }
            }, [] as SearchProducts.Items[]),
        );
        this.totalResults$ = queryResult$.pipe(map(data => data.search.totalItems));

        this.displayLoadMore$ = combineLatest(this.products$, this.totalResults$).pipe(
            map(([products, totalResults]) => {
                this.totalProducts = totalResults;
                return 0 < products.length && products.length < totalResults;
            }),
        );

    }

    trackByProductId(index: number, item: SearchProducts.Items) {
        return item.productId;
    }

    loadMore() {
        this.currentPage ++;
        this.refresh.next();
    }


    getData(slug:any) {
        return this.dataService.query<GetCollection.Query, GetCollection.Variables>(GET_COLLECTION, {
            slug,
        }).pipe(
            map(data => data.collection),
        );
    }
}
