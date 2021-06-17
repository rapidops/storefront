import { Injectable } from '@angular/core';
import {Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CampaignNameService {
  private campaignLoaded = new Subject<string>();
  private pageNameLoaded = new Subject<string>();
  private campaignRegister = new Subject<string>();

  // Observable string streams
  campaignLoaded$ = this.campaignLoaded.asObservable();
  pageNameLoaded$ = this.pageNameLoaded.asObservable();
  campaignRegistered$ = this.campaignRegister.asObservable();
  constructor() { }

  /**
   * @method setCampaign
   * @param campaign
   * @description this function is used to set campaign name
   * @tickets HTDART-24111
   */
  setCampaign(campaign: any) {
    this.campaignLoaded.next(campaign);
  }

  /**
   * @method setPageName
   * @param pageName
   * @description this function is used to set page name
   * @tickets HTDART-24111
   */
  setPageName(pageName: string) {
    this.pageNameLoaded.next(pageName);
  }

  registerCampaign(campaignId: string) {
    this.campaignRegister.next(campaignId);
  }
}
