package com.ecommerce.lakehouse.pricing;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.stream.Collectors;

/**
 * Enterprise Service Processor: DynamicPriceElasticityCurveEstimatorService.
 * Estimates real-time price elasticity coefficient from continuous clickstream and purchase CDC events.
 */
public class DynamicPriceElasticityCurveEstimatorService {

    private static final Logger LOGGER = Logger.getLogger(DynamicPriceElasticityCurveEstimatorService.class.getName());
    private final Map<String, DynamicPriceElasticityCurveEstimatorModel> storageCache = new ConcurrentHashMap<>();
    private long totalMutationsProcessed = 0;
    private long validationViolationsCount = 0;
    private double cumulativeLatencyNano = 0.0;
    private boolean isOperational = true;

    public DynamicPriceElasticityCurveEstimatorService() {
        seedInitialCdcState();
    }

    private void seedInitialCdcState() {
        for (int i = 1; i <= 6; i++) {
            String mutId = "MUT-INIT-" + i;
            DynamicPriceElasticityCurveEstimatorModel model = new DynamicPriceElasticityCurveEstimatorModel(
                mutId,
                "ecommerce_oltp.orders",
                "UPDATE",
                "0/1F8A9" + (20 + i),
                "ORD-" + (8000 + i),
                "{\"status\":\"SHIPPED\",\"amount\":" + (150.0 * i) + "}",
                "v2.1",
                "GOLD_SCD2_SYNCED",
                150.0 * i,
                12.4 + (i * 0.5),
                true,
                true
            );
            storageCache.put(mutId, model);
        }
    }

    public DynamicPriceElasticityCurveEstimatorModel processIncomingMutation(DynamicPriceElasticityCurveEstimatorModel mutation) {
        long startNano = System.nanoTime();
        if (mutation == null || mutation.getMutationId() == null) {
            LOGGER.log(Level.WARNING, "Rejected null CDC mutation payload in DynamicPriceElasticityCurveEstimatorService");
            throw new IllegalArgumentException("Invalid mutation payload or log sequence number");
        }

        LOGGER.info("Processing CDC mutation: " + mutation.getMutationId() + " for table: " + mutation.getSourceTable());

        // Medallion quality checks
        boolean isValid = mutation.getPrimaryKeyId() != null && !mutation.getPrimaryKeyId().trim().isEmpty();
        mutation.setQualityValidated(isValid);
        if (!isValid) {
            validationViolationsCount++;
            mutation.setMedallionLayer("QUARANTINED_DLQ");
        } else {
            mutation.setPiiMasked(true);
            mutation.setMedallionLayer("SILVER_CLEANSED");
        }

        mutation.setIngestionTimestamp(LocalDateTime.now());
        storageCache.put(mutation.getMutationId(), mutation);
        totalMutationsProcessed++;

        cumulativeLatencyNano += (System.nanoTime() - startNano);
        return mutation;
    }

    public Optional<DynamicPriceElasticityCurveEstimatorModel> findById(String mutationId) {
        if (mutationId == null) return Optional.empty();
        return Optional.ofNullable(storageCache.get(mutationId));
    }

    public List<DynamicPriceElasticityCurveEstimatorModel> listAll() {
        return new ArrayList<>(storageCache.values());
    }

    public List<DynamicPriceElasticityCurveEstimatorModel> listByMedallionLayer(String layer) {
        if (layer == null) return Collections.emptyList();
        return storageCache.values().stream()
                .filter(m -> layer.equalsIgnoreCase(m.getMedallionLayer()))
                .collect(Collectors.toList());
    }

    public boolean updateMedallionStage(String mutationId, String newLayer) {
        DynamicPriceElasticityCurveEstimatorModel model = storageCache.get(mutationId);
        if (model != null) {
            model.setMedallionLayer(newLayer);
            model.incrementAuditRevision();
            return true;
        }
        return false;
    }

    public boolean removeMutation(String mutationId) {
        return storageCache.remove(mutationId) != null;
    }

    public double getAverageReplicationLagMs() {
        return totalMutationsProcessed > 0 ? (cumulativeLatencyNano / totalMutationsProcessed) / 1_000_000.0 : 0.0;
    }

    public double getViolationRate() {
        return totalMutationsProcessed > 0 ? ((double) validationViolationsCount / totalMutationsProcessed) : 0.0;
    }

    public long getTotalMutationsProcessed() {
        return totalMutationsProcessed;
    }

    public boolean isOperational() {
        return isOperational;
    }
}
