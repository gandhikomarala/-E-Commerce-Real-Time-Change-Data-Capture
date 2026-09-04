-- Gold Layer: Real-Time Flash Sale Velocity Data Mart
{{ config(materialized='table', schema='gold') }}

SELECT
    toDate(order_timestamp) AS order_date,
    toHour(order_timestamp) AS order_hour,
    count(order_id) AS total_orders,
    sum(total_amount) AS total_gmv_usd,
    avg(total_amount) AS average_order_value,
    countIf(order_status = 'CANCELLED') AS cancelled_orders_count
FROM {{ ref('fct_orders_cleaned') }}
GROUP BY
    toDate(order_timestamp),
    toHour(order_timestamp)
ORDER BY
    order_date DESC,
    order_hour DESC;
