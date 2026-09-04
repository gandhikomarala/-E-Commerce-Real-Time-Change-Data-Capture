-- Silver Layer: Deduplicated & Cleansed Fact Orders
{{ config(materialized='incremental', unique_key='order_id', schema='silver') }}

WITH ranked AS (
    SELECT
        order_id,
        customer_id,
        total_amount,
        order_status,
        payment_method,
        created_at_epoch,
        cdc_operation,
        lakehouse_ingestion_ts,
        ROW_NUMBER() OVER (PARTITION BY order_id ORDER BY created_at_epoch DESC) AS rn
    FROM {{ ref('stg_cdc_raw_orders') }}
    WHERE cdc_operation != 'd'
)
SELECT
    order_id,
    customer_id,
    total_amount,
    order_status,
    payment_method,
    toDateTime(intDiv(created_at_epoch, 1000)) AS order_timestamp,
    lakehouse_ingestion_ts
FROM ranked
WHERE rn = 1;
