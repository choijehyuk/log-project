package com.maplelog.maplelog.global.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "nexon.api")
public class NexonApiProperties {

    private String key;
    private String baseUrl;
}