package com.example.E_WardApplication.dto;

import lombok.*;


@NoArgsConstructor
@Getter
@Setter
@AllArgsConstructor
@Builder

public class PatientUpdateRequestDTO {
    private String summary;
    // private String recorderName;
//    //private Long StaffId;
    private Long appUserID;

}
