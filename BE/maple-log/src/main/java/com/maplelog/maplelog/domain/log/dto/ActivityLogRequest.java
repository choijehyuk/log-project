package com.maplelog.maplelog.domain.log.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;

@Getter
public class ActivityLogRequest {

    @NotBlank(message = "내용을 입력해주세요.")
    @Size(max = 500, message = "내용은 500자 이하로 입력해주세요.")
    private String content;
}
