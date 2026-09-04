-- Gold Layer: Slowly Changing Dimensions Type 2 (SCD2)
{{ config(materialized='table', schema='gold') }}

SELECT
    customer_id,
    concat('CUST-', substring(customer_id, 1, 6), '-MASKED') AS masked_customer_name,
    customer_tier,
    shipping_city,
    shipping_country,
    valid_from,
    valid_to,
    is_current_record
FROM {{ ref('stg_cdc_raw_customers') }};
