package com.example.E_WardApplication.dto;

import lombok.*;
import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientUpdateDTO {
    private Long id;
    private Long patientId;       // from Patient
    private Instant updateDate;
    private String summary;
    private Instant createdAt;

    private Long recordedById;
    private String recordedByName;   // from AppUser.fullName
    //private String recorderUsername;

}
