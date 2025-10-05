import { inject, Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { NgxSpinnerService } from "ngx-spinner";
@Injectable({
    providedIn: 'root'
})export class LoadingService {
    private loadingSubject = new BehaviorSubject<boolean>(false);
    loading$ = this.loadingSubject.asObservable();
    private spinner = inject(NgxSpinnerService);
    show() {
      this.loadingSubject.next(true);
        this.spinner.show();
    }
  
    hide() {
        this.loadingSubject.next(false);
        this.spinner.hide();
    }
}