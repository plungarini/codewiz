import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { FooterComponent } from './components/footer/footer.component';
import { MenuComponent } from './components/menu/menu.component';
import { SiteRoutingModule } from './site-routing.module';
import { SiteComponent } from './site.component';


@NgModule({
  declarations: [
    SiteComponent,
    FooterComponent,
    MenuComponent
  ],
  imports: [
    CommonModule,
    SiteRoutingModule
  ]
})
export class SiteModule { }
