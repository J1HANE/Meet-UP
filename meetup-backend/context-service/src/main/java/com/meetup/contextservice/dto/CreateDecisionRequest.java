package com.meetup.contextservice.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateDecisionRequest {
    @NotBlank(message = "Decision text is required")
    private String text;

    @NotBlank(message = "Speaker ID is required")
    private String attributedSpeakerId;
}
