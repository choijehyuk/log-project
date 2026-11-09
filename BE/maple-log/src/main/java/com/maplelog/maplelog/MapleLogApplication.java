package com.maplelog.maplelog;

import com.maplelog.maplelog.global.config.NexonApiProperties;
import com.maplelog.maplelog.global.config.NexonOAuthProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@EnableConfigurationProperties({NexonApiProperties.class, NexonOAuthProperties.class})
public class MapleLogApplication {

    public static void main(String[] args) {
        SpringApplication.run(MapleLogApplication.class, args);
    }

}
