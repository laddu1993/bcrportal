import { Component, OnInit, ChangeDetectorRef, ViewEncapsulation  } from '@angular/core';
import { LoaderService } from '../../services/loader.service';

@Component({
  selector: 'app-progress-bar',
  templateUrl: './progress-bar.component.html',
  styleUrls: ['./progress-bar.component.css']
})
export class ProgressBarComponent implements OnInit {
  isLoading = false;

  constructor(private loaderService: LoaderService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loaderService.isLoading$.subscribe(status => {
      setTimeout(() => {
        this.isLoading = status;
      });
      this.cdr.detectChanges();
    });
  }
}
