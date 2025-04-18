import { Component, OnInit } from '@angular/core';
import { IPayPalConfig, ICreateOrderRequest } from 'ngx-paypal';



@Component({
  selector: 'app-paypal',
  standalone: false,
  templateUrl: './paypal.component.html',
  styleUrl: './paypal.component.css'
})
export class PaypalComponent {
  public payPalConfig?: IPayPalConfig;

  ngOnInit() {
    this.initConfig();
  }

  private initConfig(): void {
    this.payPalConfig = {
      currency: 'EUR',
      clientId: 'AUd0GEMFmaV5uviQDweoOZjMuIJK5LqRk6QIzj23r-AemR_oeVOGTM6QPE4X7ByofAWsC4P-boQ5rgTF', // Replace with your actual client ID
      createOrderOnClient: (data) => <ICreateOrderRequest>{
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: 'EUR',
            value: '10.00',
            breakdown: {
              item_total: {
                currency_code: 'EUR',
                value: '10.00'
              }
            }
          },
          items: [{
            name: 'Item Name',
            quantity: '1',
            category: 'DIGITAL_GOODS',
            unit_amount: {
              currency_code: 'EUR',
              value: '10.00'
            }
          }]
        }]
      },
      advanced: {
        commit: 'true'
      },
      style: {
        label: 'paypal',
        layout: 'vertical'
      },
      onApprove: (data, actions) => {
        console.log('onApprove - ha sido aprobada pero no autoizada', data, actions);
        actions.order.get().then((details: any) => {
          console.log('onApprove - ', details);
        });
      },
      onClientAuthorization: (data) => {
        console.log('onClientAuthorization - ', data);
        alert('Pago procesado correctamente');
      },
      onCancel: (data, actions) => {
        console.log('OnCancel', data, actions);
      },
      onError: err => {
        console.log('OnError', err);
      },
      onClick: (data, actions) => {
        console.log('onClick', data, actions);
      }
    };
  }

  makePayment() {
    this.payPalConfig = Object.assign({}, this.payPalConfig);
  }
}