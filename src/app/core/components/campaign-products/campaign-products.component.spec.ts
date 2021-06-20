import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CampaignProductsComponent } from './campaign-products.component';

describe('CampaignProductsComponent', () => {
  let component: CampaignProductsComponent;
  let fixture: ComponentFixture<CampaignProductsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CampaignProductsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CampaignProductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
