import {HttpClient} from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PageService {

  constructor(private httpClient: HttpClient) { }

  getPageDetails(permalink :string) {
    return this.httpClient.get('https://storefront-dev.rapidretail.io/shop/api/storefront-page/' + permalink);
  }


  getCampaignDetailsById(id: any) {
    return this.httpClient.get('api/campaign-pages/search/' + id);
  }

}
