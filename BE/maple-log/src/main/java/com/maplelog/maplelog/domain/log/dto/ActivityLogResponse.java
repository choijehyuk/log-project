package com.maplelog.maplelog.domain.log.dto;

import com.maplelog.maplelog.domain.log.entity.ActivityLog;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ActivityLogResponse {

    private Long id;
    private Long characterId;
    private String characterName;
    private String content;
    private LocalDateTime createdAt;

    public static ActivityLogResponse from(ActivityLog log) {
        return ActivityLogResponse.builder()
                .id(log.getId())
                .characterId(log.getCharacter().getId())
                .characterName(log.getCharacter().getCharacterName())
                .content(log.getContent())
                .createdAt(log.getCreatedAt())
                .build();
    }
}
