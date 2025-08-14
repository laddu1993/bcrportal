import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { LoaderService } from './services/loader.service';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{

  isLoading = false;
  environment:boolean = environment.production;
  assetUrl = environment.assetUrl;
  title = 'bcr_portal_husqvarna';

  constructor(
    private loaderService: LoaderService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loaderService.isLoading$.subscribe((status)=> {
      this.isLoading = status;

      this.cdr.detectChanges(); 
    });
  }
}
