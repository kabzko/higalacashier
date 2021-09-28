import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CheckoutdetailsPage } from './checkoutdetails.page';

describe('CheckoutdetailsPage', () => {
  let component: CheckoutdetailsPage;
  let fixture: ComponentFixture<CheckoutdetailsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CheckoutdetailsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CheckoutdetailsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
