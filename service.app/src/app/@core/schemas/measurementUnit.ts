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
 * A measurement unit
 */
export type MeasurementUnit = 'kWh' | 'MWh' | 'GWh' | 'Mbtu' | 'kWh/d' | 'kWh/m' | 'EUR/(kWh/d)/y' | 'EUR/(kWh/d)/y 0ºC' | 'EUR/slot';

export const MeasurementUnit = {
    KWh: 'kWh' as MeasurementUnit,
    Mwh: 'MWh' as MeasurementUnit,
    Gwh: 'GWh' as MeasurementUnit,
    Mbtu: 'Mbtu' as MeasurementUnit,
    KWhD: 'kWh/d' as MeasurementUnit,
    KWhM: 'kWh/m' as MeasurementUnit,
    EurKWhDY: 'EUR/(kWh/d)/y' as MeasurementUnit,
    EurKWhDY0C: 'EUR/(kWh/d)/y 0ºC' as MeasurementUnit,
    EurSlot: 'EUR/slot' as MeasurementUnit
};
