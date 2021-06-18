import { Overlay, OverlayConfig } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { DOCUMENT } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    Inject,
    OnDestroy,
    OnInit,
    TemplateRef,
    ViewChild,
    ViewContainerRef,
} from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { debounceTime, map, takeUntil } from 'rxjs/operators';

import { GetCollections } from '../../../common/generated-types';
import { GET_COLLECTIONS } from '../../../common/graphql/documents.graphql';
import { DataService } from '../../../core/providers/data/data.service';

import { arrayToTree, RootNode, TreeNode } from './array-to-tree';
// import {isPlatformBrowser} from '@angular/common';
// declare let $;
@Component({
    selector: 'vsf-collections-menu',
    templateUrl: './collections-menu.component.html',
    styleUrls: ['./collections-menu.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollectionsMenuComponent implements OnInit, OnDestroy {

    collectionTree$: Observable<RootNode<GetCollections.Items>>;
    activeCollection: TreeNode<GetCollections.Items> | null;

    @ViewChild('menuTemplate', { read: TemplateRef, static: false }) menuTemplate: TemplateRef<any>;

    private closeFn: (() => any) | null = null;
    private overlayIsOpen$ = new Subject<boolean>();
    private setActiveCollection$ = new Subject<TreeNode<GetCollections.Items>>();
    private destroy$ = new Subject();

    constructor(@Inject(DOCUMENT) private document: Document,
                private dataService: DataService,
                private overlay: Overlay,
                private viewContainerRef: ViewContainerRef) { }

    ngOnInit() {
        // this.setMenuMouseEvents();
        this.collectionTree$ = this.dataService.query<GetCollections.Query, GetCollections.Variables>(GET_COLLECTIONS, {
            options: {},
        }).pipe(
            map(data => arrayToTree(data.collections.items)),
        );

        this.overlayIsOpen$.pipe(
            debounceTime(50),
            takeUntil(this.destroy$),
        ).subscribe((val) => {
            if (val) {
                this.openOverlay();
            } else {
                this.closeOverlay();
            }
        });

        this.setActiveCollection$.pipe(
            debounceTime(0),
            takeUntil(this.destroy$),
        ).subscribe(val => {
            this.activeCollection = val;
        });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    onTopLevelClick(event: MouseEvent, collection: TreeNode<GetCollections.Items>) {
        if (collection.children.length) {
            event.preventDefault();
            event.stopImmediatePropagation();
            this.onMouseEnter(collection);
            this.registerDocumentTouchHandler();
        } else {
            this.closeOverlay();
        }
    }

    captureTouchStart(event: TouchEvent) {
        event.stopPropagation();
    }

    onMouseEnter(collection: TreeNode<GetCollections.Items>) {
        this.setActiveCollection$.next(collection);
        this.overlayIsOpen$.next(true);
    }

    close(event: any) {
        this.overlayIsOpen$.next(false);
    }
    // setMenuMouseEvents() {
    //     const isMobile = this.isMobile;
    //     const isIpad = this.isIpad;
    //     const isDesktop = this.isDesktop;
    //     if (isPlatformBrowser(this._platformId)) {
    //         $(document).ready(function () {
    //             $(document).on('click', '.nav-open', function () {
    //                 const window_height = $(window).height();
    //                 $(this).next().toggleClass('active');
    //                 $('body').toggleClass('bm-overlay-body');
    //                 const headerHeight = $('.main-header').height();
    //                 $('.hts-perfect-scrollbar').css({'height': window_height - (headerHeight + 80)}); // 80 is the height of Browse by category title when menu opens
    //
    //                 if (isDesktop) {
    //                     const menu_height = $('.hts-perfect-scrollbar').height();
    //                     $('.perfect-scrollbar-submenu').css({'max-height': menu_height - 63});
    //                 }
    //             });
    //             // For the mobile view
    //             // TODO  need to do dynamic mobile view
    //             if (isMobile && window.innerWidth > 1023) {
    //                 $(document).on('click', '.close', function () {
    //                     if ($('.side-megamenu').hasClass('active')) {
    //                         $('.side-megamenu').removeClass('active');
    //                         $('body').toggleClass('bm-overlay-body');
    //                     }
    //                 });
    //             } else if (isMobile) {
    //                 $(document).on('click', '.for-mobile .close', function () {
    //                     if ($('.side-megamenu').hasClass('active')) {
    //                         $('.side-megamenu').removeClass('active');
    //                         $('body').toggleClass('bm-overlay-body');
    //                     }
    //                 });
    //             } else {
    //                 $(document).on('click', '.close', function () {
    //                     if ($('.side-megamenu').hasClass('active')) {
    //                         $('.side-megamenu').removeClass('active');
    //                         $('body').toggleClass('bm-overlay-body');
    //                     }
    //                 });
    //             }
    //             // For the mobile view
    //             $(document).on('click', '.menutitle', function () {
    //                 $(this).next().toggleClass('active');
    //                 $('.menutitle').toggleClass('active');
    //             });
    //             $(document).on('click', 'ul.menu-nav li .category-details li a', function () {
    //                 // close menu while selecting category
    //                 if ($('.side-megamenu').hasClass('active')) {
    //                     $('.side-megamenu').removeClass('active');
    //                     $('body').toggleClass('bm-overlay-body');
    //                 }
    //             });
    //
    //             if (isDesktop) {
    //                 // for display some menu besides of main menu
    //                 $(document).on('mouseover', 'ul.menu-nav li a', function () {
    //
    //                     const window_height = $('.side-megamenu').height();
    //                     const top_position = $(this).position().top;
    //                     $('.category-details').css({'max-height': window_height});
    //                     if (top_position > (window_height / 2)) { // set bottom if selected category's height is  > window's height
    //                         $(this).next('.category-details').css({'bottom': 0, 'top': 'inherit'});
    //
    //                     } else {
    //                         $(this).next('.category-details').css({'top': 0, 'bottom': 'inherit'});
    //                     }
    //                 });
    //             }
    //
    //             if (isMobile || isIpad) { // no need to display subcategories HTDART-15921
    //                 $(document).on('click', 'ul.menu-nav li', function () {
    //                     // $(this).toggleClass('active'); // Hide submenu for mobile
    //                 });
    //                 const window_height = $(window).height();
    //                 $('.side-megamenu').css({'max-height': window_height - 150});
    //             }
    //         });
    //     }
    // }

    private openOverlay() {
        if (this.closeFn) {
            return;
        }
        const positionStrategy = this.overlay.position().flexibleConnectedTo(this.viewContainerRef.element)
            .withPositions([{
                originX : 'center',
                originY : 'bottom',
                overlayX: 'center',
                overlayY: 'top',
            }])
            .withPush(false);
        const scrollStrategy = this.overlay.scrollStrategies.reposition();
        const overlayRef = this.overlay.create(new OverlayConfig({
            scrollStrategy,
            positionStrategy,
            minWidth: '100vw',
            maxHeight: 500,
        }));
        this.closeFn = () => {
            overlayRef.dispose();
            this.closeFn = null;
        };
        const dropdown = overlayRef.attach(new TemplatePortal(this.menuTemplate, this.viewContainerRef));
    }

    private closeOverlay() {
        if (typeof this.closeFn === 'function') {
            this.closeFn();
        }
    }

    private registerDocumentTouchHandler = () => {
        const handler = () => {
            this.closeOverlay();
            this.document.removeEventListener('touchstart', handler);
        };
        this.document.addEventListener('touchstart', handler);
    }
}
