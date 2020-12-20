import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {

    constructor(
        private cookieService: CookieService
        ) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        
        const summitCookie = this.cookieService.get('summitId');

        request = request.clone({
            setHeaders: {
                Authorization: `Bearer ${summitCookie}`
            },
            withCredentials: true
        });

        return next.handle(request)
            .pipe(
                catchError((error: HttpErrorResponse) => {
                    if (error.status === 403 || error.status === 401) {
                        this.cookieService.delete('summitId');
                        window.location.href = `${environment.base}/login`
                    }
                    let errorMsg = error.message;
                    console.log(errorMsg);
                    return throwError(errorMsg);
                })
            )
    }
}