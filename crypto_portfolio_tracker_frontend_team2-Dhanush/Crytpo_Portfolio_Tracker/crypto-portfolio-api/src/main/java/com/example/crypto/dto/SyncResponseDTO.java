package com.example.crypto.dto;

public class SyncResponseDTO {
    private String jobId;
    private String statusUrl;

    // Constructors
    public SyncResponseDTO() {}

    public SyncResponseDTO(String jobId, String statusUrl) {
        this.jobId = jobId;
        this.statusUrl = statusUrl;
    }

    // Getters and Setters
    public String getJobId() {
        return jobId;
    }

    public void setJobId(String jobId) {
        this.jobId = jobId;
    }

    public String getStatusUrl() {
        return statusUrl;
    }

    public void setStatusUrl(String statusUrl) {
        this.statusUrl = statusUrl;
    }
}