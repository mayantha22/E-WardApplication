package com.example.E_WardApplication.entity;

//import com.example.E_WardApplication.security.JpaConverterJson;
import io.hypersistence.utils.hibernate.type.json.JsonType;
import org.hibernate.annotations.Type;
import jakarta.persistence.*;
import lombok.*;


import java.time.Instant;
import java.util.Map;

@Entity
@Table(name = "duty_roster")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DutyRoster {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int month;
    private int year;
    private String ward;

    @Type(JsonType.class)                       // 👈 Hypersistence magic here
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> data; // JSON string for assignments


    private Instant createdAt = Instant.now();
}
