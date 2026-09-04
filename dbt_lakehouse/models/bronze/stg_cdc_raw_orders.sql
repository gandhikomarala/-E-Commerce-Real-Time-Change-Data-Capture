-- Bronze Layer: Raw Debezium CDC Orders Stream
{{ config(materialized='incremental', unique_key='order_id', schema='bronze') }}

SELECT
    JSONExtractString(payload, 'order_id') AS order_id,
    JSONExtractString(payload, 'customer_id') AS customer_id,
    JSONExtractFloat(payload, 'total_amount') AS total_amount,
    JSONExtractString(payload, 'order_status') AS order_status,
    JSONExtractString(payload, 'payment_method') AS payment_method,
    JSONExtractInt(payload, 'created_at_epoch') AS created_at_epoch,
    JSONExtractString(payload, 'op_type') AS cdc_operation,
    toDateTime(now()) AS lakehouse_ingestion_ts
FROM {{ source('cdc_raw', 'orders_cdc_stream') }};
