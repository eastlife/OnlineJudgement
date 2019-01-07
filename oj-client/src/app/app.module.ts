import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ProblemListComponent } from './components/problem-list/problem-list.component';

import { routing } from "./app-routing.module";

import { DataService } from "./services/data.service";
import { ProblemDetailComponent } from './components/problem-detail/problem-detail.component';
@NgModule({
  declarations: [
    AppComponent,
    ProblemListComponent,
    ProblemDetailComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    routing,
  ],
  providers: [{
  	provide: "data",
  	useClass: DataService
  }],
  bootstrap: [AppComponent]
})
export class AppModule { }
