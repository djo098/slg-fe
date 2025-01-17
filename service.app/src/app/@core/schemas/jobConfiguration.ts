/**
 * SLG API
 * REST API for the New SLG (Novo Sistema de Logística de Gás)
 *
 * The version of the OpenAPI document: 1.0.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */


/**
 * Job Configuration
 */
export interface JobConfiguration { 
    active?: boolean;
    daily_start_time?: string;
    daily_end_time?: string;
    periodicity?: number;
    workflow_id?: string;
}

