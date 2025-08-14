import { Component, Input } from '@angular/core';
import { LoaderService } from '../../services/loader.service';

@Component({
  selector: 'app-skeleton-loader',
  templateUrl: './skeleton-loader.component.html',
  styleUrl: './skeleton-loader.component.css'
})
export class SkeletonLoaderComponent {

  @Input() rowCount:number = 5;

  constructor(private loaderService:LoaderService) {}

  isLoading = false;

  ngOnInit() {
    this.loaderService.isLoading$.subscribe(status => {
      setTimeout(() => {
        this.isLoading = status;
      });
    });
  }

  get skeletonRows() {
    return Array(this.rowCount).fill(0);
  }
}
