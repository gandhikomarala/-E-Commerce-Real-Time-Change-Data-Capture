package com.ecommerce.lakehouse.storage;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

/**
 * Enterprise CDC Lakehouse Model: ApacheHudiIncrementalTimelineSyncModel.
 * Synchronizes Apache Hudi timeline metadata for incremental change data capture (CDC) replay.
 */
public class ApacheHudiIncrementalTimelineSyncModel implements Serializable {

    private static final long serialVersionUID = 1L;

    private String mutationId;
    private String sourceTable;
    private String operationType;
    private String walLogSequenceNumber;
    private String primaryKeyId;
    private String payloadJson;
    private String schemaVersion;
    private String medallionLayer;
    private Double transactionAmount;
    private Double replicationLagMs;
    private boolean isPiiMasked;
    private boolean isQualityValidated;
    private boolean isScd2Current;
    private int schemaAuditRevision;
    private LocalDateTime sourceTimestamp;
    private LocalDateTime ingestionTimestamp;
    private LocalDateTime validFromTimestamp;
    private LocalDateTime validToTimestamp;

    public ApacheHudiIncrementalTimelineSyncModel() {
        this.mutationId = "MUT-" + UUID.randomUUID().toString();
        this.operationType = "UPDATE";
        this.medallionLayer = "SILVER_CLEANSED";
        this.isPiiMasked = true;
        this.isQualityValidated = true;
        this.isScd2Current = true;
        this.schemaAuditRevision = 1;
        this.sourceTimestamp = LocalDateTime.now();
        this.ingestionTimestamp = LocalDateTime.now();
        this.validFromTimestamp = LocalDateTime.now();
    }

    public ApacheHudiIncrementalTimelineSyncModel(String mutationId, String sourceTable, String operationType,
                              String walLogSequenceNumber, String primaryKeyId, String payloadJson,
                              String schemaVersion, String medallionLayer, Double transactionAmount,
                              Double replicationLagMs, boolean isPiiMasked, boolean isQualityValidated) {
        this.mutationId = mutationId != null ? mutationId : "MUT-" + UUID.randomUUID().toString();
        this.sourceTable = sourceTable;
        this.operationType = operationType != null ? operationType : "UPDATE";
        this.walLogSequenceNumber = walLogSequenceNumber;
        this.primaryKeyId = primaryKeyId;
        this.payloadJson = payloadJson;
        this.schemaVersion = schemaVersion != null ? schemaVersion : "v1.0";
        this.medallionLayer = medallionLayer != null ? medallionLayer : "BRONZE_RAW";
        this.transactionAmount = transactionAmount;
        this.replicationLagMs = replicationLagMs;
        this.isPiiMasked = isPiiMasked;
        this.isQualityValidated = isQualityValidated;
        this.isScd2Current = true;
        this.schemaAuditRevision = 1;
        this.sourceTimestamp = LocalDateTime.now();
        this.ingestionTimestamp = LocalDateTime.now();
        this.validFromTimestamp = LocalDateTime.now();
    }

    public String getMutationId() { return mutationId; }
    public void setMutationId(String mutationId) { this.mutationId = mutationId; }

    public String getSourceTable() { return sourceTable; }
    public void setSourceTable(String sourceTable) { this.sourceTable = sourceTable; }

    public String getOperationType() { return operationType; }
    public void setOperationType(String operationType) { this.operationType = operationType; }

    public String getWalLogSequenceNumber() { return walLogSequenceNumber; }
    public void setWalLogSequenceNumber(String walLogSequenceNumber) { this.walLogSequenceNumber = walLogSequenceNumber; }

    public String getPrimaryKeyId() { return primaryKeyId; }
    public void setPrimaryKeyId(String primaryKeyId) { this.primaryKeyId = primaryKeyId; }

    public String getPayloadJson() { return payloadJson; }
    public void setPayloadJson(String payloadJson) { this.payloadJson = payloadJson; }

    public String getSchemaVersion() { return schemaVersion; }
    public void setSchemaVersion(String schemaVersion) { this.schemaVersion = schemaVersion; }

    public String getMedallionLayer() { return medallionLayer; }
    public void setMedallionLayer(String medallionLayer) { this.medallionLayer = medallionLayer; }

    public Double getTransactionAmount() { return transactionAmount; }
    public void setTransactionAmount(Double transactionAmount) { this.transactionAmount = transactionAmount; }

    public Double getReplicationLagMs() { return replicationLagMs; }
    public void setReplicationLagMs(Double replicationLagMs) { this.replicationLagMs = replicationLagMs; }

    public boolean isPiiMasked() { return isPiiMasked; }
    public void setPiiMasked(boolean piiMasked) { isPiiMasked = piiMasked; }

    public boolean isQualityValidated() { return isQualityValidated; }
    public void setQualityValidated(boolean qualityValidated) { isQualityValidated = qualityValidated; }

    public boolean isScd2Current() { return isScd2Current; }
    public void setScd2Current(boolean scd2Current) { isScd2Current = scd2Current; }

    public int getSchemaAuditRevision() { return schemaAuditRevision; }
    public void setSchemaAuditRevision(int schemaAuditRevision) { this.schemaAuditRevision = schemaAuditRevision; }

    public LocalDateTime getSourceTimestamp() { return sourceTimestamp; }
    public void setSourceTimestamp(LocalDateTime sourceTimestamp) { this.sourceTimestamp = sourceTimestamp; }

    public LocalDateTime getIngestionTimestamp() { return ingestionTimestamp; }
    public void setIngestionTimestamp(LocalDateTime ingestionTimestamp) { this.ingestionTimestamp = ingestionTimestamp; }

    public LocalDateTime getValidFromTimestamp() { return validFromTimestamp; }
    public void setValidFromTimestamp(LocalDateTime validFromTimestamp) { this.validFromTimestamp = validFromTimestamp; }

    public LocalDateTime getValidToTimestamp() { return validToTimestamp; }
    public void setValidToTimestamp(LocalDateTime validToTimestamp) { this.validToTimestamp = validToTimestamp; }

    public void incrementAuditRevision() {
        this.schemaAuditRevision++;
        this.ingestionTimestamp = LocalDateTime.now();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ApacheHudiIncrementalTimelineSyncModel that = (ApacheHudiIncrementalTimelineSyncModel) o;
        return Objects.equals(mutationId, that.mutationId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(mutationId);
    }

    @Override
    public String toString() {
        return "ApacheHudiIncrementalTimelineSyncModel{" +
                "mutationId='" + mutationId + '\'' +
                ", sourceTable='" + sourceTable + '\'' +
                ", op='" + operationType + '\'' +
                ", layer='" + medallionLayer + '\'' +
                ", lagMs=" + replicationLagMs +
                ", valid=" + isQualityValidated +
                '}';
    }
}
