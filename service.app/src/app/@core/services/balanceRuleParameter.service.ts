
import { Inject, Injectable, Optional }                      from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams,
         HttpResponse, HttpEvent, HttpParameterCodec, HttpContext,
        }       from '@angular/common/http';
import { CustomHttpParameterCodec }                          from '../../encoder';
import { Observable }                                        from 'rxjs';

// @ts-ignore
import { BalanceRule } from '../schemas/balanceRule';
// @ts-ignore
import { BalanceRuleParameter } from '../schemas/balanceRuleParameter';

// @ts-ignore
import { BASE_PATH, COLLECTION_FORMATS }                     from '../../variables';
import { Configuration }                                     from '../../configuration';
import { ProfileService } from './sharedServices/auth.service';



@Injectable({
  providedIn: 'root',
})
export class BalanceRuleParameterService {

    protected basePath = BASE_PATH;
    public defaultHeaders = new HttpHeaders();
    public configuration = new Configuration();
    public encoder: HttpParameterCodec;
    constructor(protected httpClient: HttpClient, @Optional()@Inject(BASE_PATH) basePath: string|string[], @Optional() configuration: Configuration,private profileService : ProfileService) {
        if (configuration) {
            this.configuration = configuration;
        }
        if (typeof this.configuration.basePath !== 'string') {
            if (Array.isArray(basePath) && basePath.length > 0) {
                basePath = basePath[0];
            }

            if (typeof basePath !== 'string') {
                basePath = this.basePath;
            }
            this.configuration.basePath = basePath;
        }
        this.encoder = this.configuration.encoder || new CustomHttpParameterCodec();

        
    }


    // @ts-ignore
    private addToHttpParams(httpParams: HttpParams, value: any, key?: string): HttpParams {
        if (typeof value === 'object' && value instanceof Date === false) {
            httpParams = this.addToHttpParamsRecursive(httpParams, value);
        } else {
            httpParams = this.addToHttpParamsRecursive(httpParams, value, key);
        }
        return httpParams;
    }

    private addToHttpParamsRecursive(httpParams: HttpParams, value?: any, key?: string): HttpParams {
        if (value == null) {
            return httpParams;
        }

        if (typeof value === 'object') {
            if (Array.isArray(value)) {
                (value as any[]).forEach( elem => httpParams = this.addToHttpParamsRecursive(httpParams, elem, key));
            } else if (value instanceof Date) {
                if (key != null) {
                    httpParams = httpParams.append(key, (value as Date).toISOString().substr(0, 10));
                } else {
                   throw Error('key may not be null if value is Date');
                }
            } else {
                Object.keys(value).forEach( k => httpParams = this.addToHttpParamsRecursive(
                    httpParams, value[k], key != null ? `${key}.${k}` : k));
            }
        } else if (key != null) {
            httpParams = httpParams.append(key, value);
        } else {
            throw Error('key may not be null if value is not object or array');
        }
        return httpParams;
    }

    /**
     * Add a new balance rules parameter
     *
     * @param balanceRuleParameter BalanceRuleParameter object to add to master data
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public addBalanceRuleParameter(balanceRuleParameter: BalanceRuleParameter, observe?: 'body', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json', context?: HttpContext}): Observable<BalanceRuleParameter>;
    public addBalanceRuleParameter(balanceRuleParameter: BalanceRuleParameter, observe?: 'response', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json', context?: HttpContext}): Observable<HttpResponse<BalanceRuleParameter>>;
    public addBalanceRuleParameter(balanceRuleParameter: BalanceRuleParameter, observe?: 'events', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json', context?: HttpContext}): Observable<HttpEvent<BalanceRuleParameter>>;
    public addBalanceRuleParameter(balanceRuleParameter: BalanceRuleParameter, observe: any = 'body', reportProgress: boolean = false, options?: {httpHeaderAccept?: 'application/json', context?: HttpContext}): Observable<any> {
        if (balanceRuleParameter === null || balanceRuleParameter === undefined) {
            throw new Error('Required parameter balanceRuleParameter was null or undefined when calling addBalanceRuleParameter.');
        }

        let localVarHeaders = this.defaultHeaders;

        let localVarHttpHeaderAcceptSelected: string | undefined = options && options.httpHeaderAccept;
        if (localVarHttpHeaderAcceptSelected === undefined) {
            // to determine the Accept header
            const httpHeaderAccepts: string[] = [
                'application/json',
            ];
            localVarHttpHeaderAcceptSelected = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        }
        if (localVarHttpHeaderAcceptSelected !== undefined) {
            localVarHeaders = localVarHeaders.set('Accept', localVarHttpHeaderAcceptSelected);
        }

        let localVarHttpContext: HttpContext | undefined = options && options.context;
        if (localVarHttpContext === undefined) {
            localVarHttpContext = new HttpContext();
        }


        // to determine the Content-Type header
        const consumes: string[] = [
            'application/json',
        ];
        const httpContentTypeSelected: string | undefined = this.configuration.selectHeaderContentType(consumes);
        if (httpContentTypeSelected !== undefined) {
            localVarHeaders = localVarHeaders.set('Content-Type', httpContentTypeSelected);
        }

        let responseType_: 'text' | 'json' | 'blob' = 'json';
        if (localVarHttpHeaderAcceptSelected) {
            if (localVarHttpHeaderAcceptSelected.startsWith('text')) {
                responseType_ = 'text';
            } else if (this.configuration.isJsonMime(localVarHttpHeaderAcceptSelected)) {
                responseType_ = 'json';
            } else {
                responseType_ = 'blob';
            }
        }

        const localVarPath = `/masterdata/balanceruleparameters`;
        return this.httpClient.request<BalanceRuleParameter>('post', `${this.configuration.basePath}${localVarPath}`,
            {
                context: localVarHttpContext,
                body: balanceRuleParameter,
                responseType: <any>responseType_,
                withCredentials: this.configuration.withCredentials,
                headers: localVarHeaders,
                observe: observe,
                reportProgress: reportProgress,
            },
        );
    }

    /**
     * Returns all Balance Rules Parameters
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public getBalanceRuleParameters(observe?: 'body', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json', context?: HttpContext}): Observable<Array<BalanceRuleParameter>>;
    public getBalanceRuleParameters(observe?: 'response', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json', context?: HttpContext}): Observable<HttpResponse<Array<BalanceRuleParameter>>>;
    public getBalanceRuleParameters(observe?: 'events', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json', context?: HttpContext}): Observable<HttpEvent<Array<BalanceRuleParameter>>>;
    public getBalanceRuleParameters(observe: any = 'body', reportProgress: boolean = false, options?: {httpHeaderAccept?: 'application/json', context?: HttpContext}): Observable<any> {

        let localVarHeaders = this.defaultHeaders;

        let localVarHttpHeaderAcceptSelected: string | undefined = options && options.httpHeaderAccept;
        if (localVarHttpHeaderAcceptSelected === undefined) {
            // to determine the Accept header
            const httpHeaderAccepts: string[] = [
                'application/json',
            ];
            localVarHttpHeaderAcceptSelected = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        }
        if (localVarHttpHeaderAcceptSelected !== undefined) {
            localVarHeaders = localVarHeaders.set('Accept', localVarHttpHeaderAcceptSelected);
        }

        let localVarHttpContext: HttpContext | undefined = options && options.context;
        if (localVarHttpContext === undefined) {
            localVarHttpContext = new HttpContext();
        }


        let responseType_: 'text' | 'json' | 'blob' = 'json';
        if (localVarHttpHeaderAcceptSelected) {
            if (localVarHttpHeaderAcceptSelected.startsWith('text')) {
                responseType_ = 'text';
            } else if (this.configuration.isJsonMime(localVarHttpHeaderAcceptSelected)) {
                responseType_ = 'json';
            } else {
                responseType_ = 'blob';
            }
        }

        const localVarPath = `/masterdata/balanceruleparameters`;
        return this.httpClient.request<Array<BalanceRuleParameter>>('get', `${this.configuration.basePath}${localVarPath}`,
            {
                context: localVarHttpContext,
                responseType: <any>responseType_,
                withCredentials: this.configuration.withCredentials,
                headers: localVarHeaders,
                observe: observe,
                reportProgress: reportProgress,
            },
        );
    }

    /**
     * Returns all balance rule parameters for a certain rule
     *
     * @param ruleLabel
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public getParams(ruleLabel: string, observe?: 'body', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json', context?: HttpContext}): Observable<Array<BalanceRuleParameter>>;
    public getParams(ruleLabel: string, observe?: 'response', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json', context?: HttpContext}): Observable<HttpResponse<Array<BalanceRuleParameter>>>;
    public getParams(ruleLabel: string, observe?: 'events', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json', context?: HttpContext}): Observable<HttpEvent<Array<BalanceRuleParameter>>>;
    public getParams(ruleLabel: string, observe: any = 'body', reportProgress: boolean = false, options?: {httpHeaderAccept?: 'application/json', context?: HttpContext}): Observable<any> {
        if (ruleLabel === null || ruleLabel === undefined) {
            throw new Error('Required parameter ruleLabel was null or undefined when calling getParams.');
        }

        let localVarQueryParameters = new HttpParams({encoder: this.encoder});
        if (ruleLabel !== undefined && ruleLabel !== null) {
          localVarQueryParameters = this.addToHttpParams(localVarQueryParameters,
            <any>ruleLabel, 'rule_label');
        }

        let localVarHeaders = this.defaultHeaders;

        let localVarHttpHeaderAcceptSelected: string | undefined = options && options.httpHeaderAccept;
        if (localVarHttpHeaderAcceptSelected === undefined) {
            // to determine the Accept header
            const httpHeaderAccepts: string[] = [
                'application/json',
            ];
            localVarHttpHeaderAcceptSelected = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        }
        if (localVarHttpHeaderAcceptSelected !== undefined) {
            localVarHeaders = localVarHeaders.set('Accept', localVarHttpHeaderAcceptSelected);
        }

        let localVarHttpContext: HttpContext | undefined = options && options.context;
        if (localVarHttpContext === undefined) {
            localVarHttpContext = new HttpContext();
        }


        let responseType_: 'text' | 'json' | 'blob' = 'json';
        if (localVarHttpHeaderAcceptSelected) {
            if (localVarHttpHeaderAcceptSelected.startsWith('text')) {
                responseType_ = 'text';
            } else if (this.configuration.isJsonMime(localVarHttpHeaderAcceptSelected)) {
                responseType_ = 'json';
            } else {
                responseType_ = 'blob';
            }
        }

        const localVarPath = `/masterdata/balanceruleparameters/getParams`;
        return this.httpClient.request<Array<BalanceRuleParameter>>('get', `${this.configuration.basePath}${localVarPath}`,
            {
                context: localVarHttpContext,
                params: localVarQueryParameters,
                responseType: <any>responseType_,
                withCredentials: this.configuration.withCredentials,
                headers: localVarHeaders,
                observe: observe,
                reportProgress: reportProgress,
            },
        );
    }

    /**
     * Update an existing balance rule parameter
     *
     * @param balanceRuleParameter BalanceRuleParameter object to add to master data
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public updateBalanceRuleParameter(balanceRuleParameter: BalanceRuleParameter, observe?: 'body', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json', context?: HttpContext}): Observable<BalanceRuleParameter>;
    public updateBalanceRuleParameter(balanceRuleParameter: BalanceRuleParameter, observe?: 'response', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json', context?: HttpContext}): Observable<HttpResponse<BalanceRuleParameter>>;
    public updateBalanceRuleParameter(balanceRuleParameter: BalanceRuleParameter, observe?: 'events', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json', context?: HttpContext}): Observable<HttpEvent<BalanceRuleParameter>>;
    public updateBalanceRuleParameter(balanceRuleParameter: BalanceRuleParameter, observe: any = 'body', reportProgress: boolean = false, options?: {httpHeaderAccept?: 'application/json', context?: HttpContext}): Observable<any> {
        if (balanceRuleParameter === null || balanceRuleParameter === undefined) {
            throw new Error('Required parameter balanceRuleParameter was null or undefined when calling updateBalanceRuleParameter.');
        }

        let localVarHeaders = this.defaultHeaders;

        let localVarHttpHeaderAcceptSelected: string | undefined = options && options.httpHeaderAccept;
        if (localVarHttpHeaderAcceptSelected === undefined) {
            // to determine the Accept header
            const httpHeaderAccepts: string[] = [
                'application/json',
            ];
            localVarHttpHeaderAcceptSelected = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        }
        if (localVarHttpHeaderAcceptSelected !== undefined) {
            localVarHeaders = localVarHeaders.set('Accept', localVarHttpHeaderAcceptSelected);
        }

        let localVarHttpContext: HttpContext | undefined = options && options.context;
        if (localVarHttpContext === undefined) {
            localVarHttpContext = new HttpContext();
        }


        // to determine the Content-Type header
        const consumes: string[] = [
            'application/json',
        ];
        const httpContentTypeSelected: string | undefined = this.configuration.selectHeaderContentType(consumes);
        if (httpContentTypeSelected !== undefined) {
            localVarHeaders = localVarHeaders.set('Content-Type', httpContentTypeSelected);
        }

        let responseType_: 'text' | 'json' | 'blob' = 'json';
        if (localVarHttpHeaderAcceptSelected) {
            if (localVarHttpHeaderAcceptSelected.startsWith('text')) {
                responseType_ = 'text';
            } else if (this.configuration.isJsonMime(localVarHttpHeaderAcceptSelected)) {
                responseType_ = 'json';
            } else {
                responseType_ = 'blob';
            }
        }

        const localVarPath = `/masterdata/balanceruleparameters`;
        return this.httpClient.request<BalanceRuleParameter>('put', `${this.configuration.basePath}${localVarPath}`,
            {
                context: localVarHttpContext,
                body: balanceRuleParameter,
                responseType: <any>responseType_,
                withCredentials: this.configuration.withCredentials,
                headers: localVarHeaders,
                observe: observe,
                reportProgress: reportProgress,
            },
        );
    }

}
