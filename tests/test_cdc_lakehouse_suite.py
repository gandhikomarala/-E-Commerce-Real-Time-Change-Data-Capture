import unittest
import time

def parse_debezium_cdc_payload(payload):
    op = payload.get("op", "READ")
    before = payload.get("before")
    after = payload.get("after")
    ts_ms = payload.get("ts_ms", int(time.time() * 1000))

    if op == "c":  # Create / Insert
        mutation_type = "INSERT"
        record = after
    elif op == "u":  # Update
        mutation_type = "UPDATE"
        record = after
    elif op == "d":  # Delete
        mutation_type = "DELETE"
        record = before
    else:
        mutation_type = "SNAPSHOT"
        record = after

    return {
        "mutation_type": mutation_type,
        "record": record,
        "timestamp_ms": ts_ms,
        "is_valid": record is not None
    }

def mask_pii_fields(record):
    if not record:
        return {}
    cleaned = dict(record)
    if "email" in cleaned:
        parts = cleaned["email"].split("@")
        if len(parts) == 2:
            cleaned["email"] = parts[0][:2] + "****@" + parts[1]
    if "credit_card" in cleaned:
        cc = str(cleaned["credit_card"]).replace("-", "")
        cleaned["credit_card"] = "XXXX-XXXX-XXXX-" + cc[-4:]
    return cleaned

def evaluate_scd2_dimension_merge(existing_version, new_record):
    # If attribute changed, retire old version and create new active version
    if existing_version["price"] != new_record["price"]:
        old_retired = dict(existing_version)
        old_retired["is_current"] = False
        old_retired["valid_to"] = new_record["timestamp"]

        new_active = dict(new_record)
        new_active["version"] = existing_version["version"] + 1
        new_active["is_current"] = True
        new_active["valid_from"] = new_record["timestamp"]
        new_active["valid_to"] = None
        return [old_retired, new_active]
    return [existing_version]

class TestCdcLakehousePipeline(unittest.TestCase):

    def test_debezium_update_parser(self):
        raw_event = {
            "op": "u",
            "before": {"order_id": "ORD-1", "status": "PENDING", "price": 100.0},
            "after": {"order_id": "ORD-1", "status": "SHIPPED", "price": 100.0},
            "ts_ms": 1710000000000
        }
        res = parse_debezium_cdc_payload(raw_event)
        self.assertEqual(res["mutation_type"], "UPDATE")
        self.assertEqual(res["record"]["status"], "SHIPPED")
        self.assertTrue(res["is_valid"])

    def test_pii_masking_compliance(self):
        customer = {
            "cust_id": "CUST-99",
            "email": "sarah.connor@cyberdyne.com",
            "credit_card": "4532-1111-2222-8899"
        }
        masked = mask_pii_fields(customer)
        self.assertEqual(masked["email"], "sa****@cyberdyne.com")
        self.assertEqual(masked["credit_card"], "XXXX-XXXX-XXXX-8899")

    def test_scd2_historical_dimension_versioning(self):
        v1 = {
            "product_id": "SKU-900",
            "price": 299.99,
            "version": 1,
            "is_current": True,
            "valid_from": "2026-01-01T00:00:00Z",
            "valid_to": None
        }
        v2_mutation = {
            "product_id": "SKU-900",
            "price": 249.99,
            "timestamp": "2026-03-01T12:00:00Z"
        }
        merged = evaluate_scd2_dimension_merge(v1, v2_mutation)
        self.assertEqual(len(merged), 2)
        self.assertFalse(merged[0]["is_current"])
        self.assertEqual(merged[0]["valid_to"], "2026-03-01T12:00:00Z")
        self.assertTrue(merged[1]["is_current"])
        self.assertEqual(merged[1]["version"], 2)
        self.assertEqual(merged[1]["price"], 249.99)

    def test_debezium_delete_quarantine(self):
        delete_event = {
            "op": "d",
            "before": {"order_id": "ORD-99", "status": "CANCELLED"},
            "after": None,
            "ts_ms": 1710000050000
        }
        res = parse_debezium_cdc_payload(delete_event)
        self.assertEqual(res["mutation_type"], "DELETE")
        self.assertEqual(res["record"]["order_id"], "ORD-99")

if __name__ == '__main__':
    unittest.main()
