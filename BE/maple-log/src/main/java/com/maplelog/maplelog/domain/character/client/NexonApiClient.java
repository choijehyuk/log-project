package com.maplelog.maplelog.domain.character.client;

import com.maplelog.maplelog.domain.character.dto.nexon.CharacterBasicResponse;
import com.maplelog.maplelog.domain.character.dto.nexon.NexonAndroidResponse;
import com.maplelog.maplelog.domain.character.dto.nexon.CharacterOcidResponse;
import com.maplelog.maplelog.domain.character.dto.nexon.CharacterStatResponse;
import com.maplelog.maplelog.domain.character.dto.nexon.NexonCharacterListResponse;
import com.maplelog.maplelog.domain.character.dto.nexon.NexonEquipmentResponse;
import com.maplelog.maplelog.domain.character.dto.nexon.NexonScheduleResponse;
import com.maplelog.maplelog.global.config.NexonApiProperties;
import com.maplelog.maplelog.global.exception.NexonApiException;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
public class NexonApiClient {

    private static final String OCID_PATH = "/maplestory/v1/id";
    private static final String CHARACTER_LIST_PATH = "/maplestory/v1/character/list";
    private static final String CHARACTER_BASIC_PATH = "/maplestory/v1/character/basic";
    private static final String CHARACTER_STAT_PATH = "/maplestory/v1/character/stat";
    private static final String CHARACTER_SCHEDULE_PATH = "/maplestory/v1/character/schedule";
    private static final String CHARACTER_EQUIPMENT_PATH = "/maplestory/v1/character/item-equipment";
    private static final String CHARACTER_ANDROID_PATH = "/maplestory/v1/character/android-equipment";

    private final RestClient nexonRestClient;
    private final NexonApiProperties nexonApiProperties;

    // @Primary인 범용 restClient가 주입되지 않도록 넥슨 전용 클라이언트를 명시
    public NexonApiClient(@Qualifier("nexonRestClient") RestClient nexonRestClient,
                          NexonApiProperties nexonApiProperties) {
        this.nexonRestClient = nexonRestClient;
        this.nexonApiProperties = nexonApiProperties;
    }

    public String getCharacterOcid(String characterName) {
        CharacterOcidResponse response = nexonRestClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path(OCID_PATH)
                        .queryParam("character_name", characterName)
                        .build())
                .retrieve()
                .onStatus(status -> status.is4xxClientError() || status.is5xxServerError(),
                        (req, res) -> {
                            throw new NexonApiException(res.getStatusCode().value(),
                                    "캐릭터 OCID 조회 실패: " + characterName);
                        })
                .body(CharacterOcidResponse.class);

        if (response == null || response.getOcid() == null) {
            throw new NexonApiException(404, "캐릭터를 찾을 수 없습니다: " + characterName);
        }
        return response.getOcid();
    }

    public CharacterBasicResponse getCharacterBasic(String ocid) {
        CharacterBasicResponse response = nexonRestClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path(CHARACTER_BASIC_PATH)
                        .queryParam("ocid", ocid)
                        .build())
                .retrieve()
                .onStatus(status -> status.is4xxClientError() || status.is5xxServerError(),
                        (req, res) -> {
                            throw new NexonApiException(res.getStatusCode().value(),
                                    "캐릭터 기본 정보 조회 실패");
                        })
                .body(CharacterBasicResponse.class);

        if (response == null) {
            throw new NexonApiException(404, "캐릭터 기본 정보를 찾을 수 없습니다");
        }
        return response;
    }

    public CharacterStatResponse getCharacterStat(String ocid) {
        CharacterStatResponse response = nexonRestClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path(CHARACTER_STAT_PATH)
                        .queryParam("ocid", ocid)
                        .build())
                .retrieve()
                .onStatus(status -> status.is4xxClientError() || status.is5xxServerError(),
                        (req, res) -> {
                            throw new NexonApiException(res.getStatusCode().value(), "캐릭터 스탯 조회 실패");
                        })
                .body(CharacterStatResponse.class);

        if (response == null) {
            throw new NexonApiException(404, "캐릭터 스탯 정보를 찾을 수 없습니다");
        }
        return response;
    }

    public NexonEquipmentResponse getCharacterEquipment(String ocid) {
        NexonEquipmentResponse response = nexonRestClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path(CHARACTER_EQUIPMENT_PATH)
                        .queryParam("ocid", ocid)
                        .build())
                .retrieve()
                .onStatus(status -> status.is4xxClientError() || status.is5xxServerError(),
                        (req, res) -> {
                            throw new NexonApiException(res.getStatusCode().value(), "장비 정보 조회 실패");
                        })
                .body(NexonEquipmentResponse.class);

        if (response == null) {
            throw new NexonApiException(404, "장비 정보를 찾을 수 없습니다");
        }
        return response;
    }

    public NexonAndroidResponse getCharacterAndroid(String ocid) {
        NexonAndroidResponse response = nexonRestClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path(CHARACTER_ANDROID_PATH)
                        .queryParam("ocid", ocid)
                        .build())
                .retrieve()
                .onStatus(status -> status.is4xxClientError() || status.is5xxServerError(),
                        (req, res) -> {
                            throw new NexonApiException(res.getStatusCode().value(), "안드로이드 정보 조회 실패");
                        })
                .body(NexonAndroidResponse.class);

        if (response == null) {
            throw new NexonApiException(404, "안드로이드 정보를 찾을 수 없습니다");
        }
        return response;
    }

    // 유저 본인의 API키로 보유 캐릭터 목록 조회
    public NexonCharacterListResponse getCharacterList(String userApiKey) {
        NexonCharacterListResponse response = RestClient.create(nexonApiProperties.getBaseUrl()).get()
                .uri(CHARACTER_LIST_PATH)
                .header("x-nxopen-api-key", userApiKey)
                .retrieve()
                .onStatus(status -> status.is4xxClientError() || status.is5xxServerError(),
                        (req, res) -> {
                            throw new NexonApiException(res.getStatusCode().value(), "캐릭터 목록 조회 실패");
                        })
                .body(NexonCharacterListResponse.class);

        if (response == null) {
            throw new NexonApiException(404, "캐릭터 목록을 찾을 수 없습니다");
        }
        return response;
    }

    // 유저 본인의 API키 또는 OAuth 토큰으로 스케줄 조회
    public NexonScheduleResponse getCharacterSchedule(String ocid, String date, String userApiKey) {
        NexonScheduleResponse response = RestClient.create(nexonApiProperties.getBaseUrl()).get()
                .uri(uriBuilder -> uriBuilder
                        .path(CHARACTER_SCHEDULE_PATH)
                        .queryParam("ocid", ocid)
                        .queryParam("date", date)
                        .build())
                .header("x-nxopen-api-key", userApiKey)
                .retrieve()
                .onStatus(status -> status.is4xxClientError() || status.is5xxServerError(),
                        (req, res) -> {
                            throw new NexonApiException(res.getStatusCode().value(), "스케줄 정보 조회 실패");
                        })
                .body(NexonScheduleResponse.class);

        if (response == null) {
            throw new NexonApiException(404, "스케줄 정보를 찾을 수 없습니다");
        }
        return response;
    }
}
