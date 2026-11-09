package com.maplelog.maplelog.global.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.web.client.RestClient;

@Configuration
public class RestClientConfig {

    // 넥슨 공개 API용 (서버 API 키 사용, 캐릭터 검색 등)
    @Bean
    public RestClient nexonRestClient(NexonApiProperties properties) {
        return RestClient.builder()
                .baseUrl(properties.getBaseUrl())
                .defaultHeader("x-nxopen-api-key", properties.getKey())
                .build();
    }

    // OAuth 토큰 교환, 유저 정보 등 범용 RestClient
    @Bean
    @Primary
    public RestClient restClient() {
        return RestClient.builder().build();
    }
}
