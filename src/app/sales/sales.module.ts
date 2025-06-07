import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SalesPage } from './sales.page';
import { ExploreContainerComponentModule } from '../explore-container/explore-container.module';

import { SalesPageRoutingModule } from './sales-routing.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ExploreContainerComponentModule,
    SalesPageRoutingModule
  ],
  declarations: [SalesPage]
})
export class SalesPageModule {}
