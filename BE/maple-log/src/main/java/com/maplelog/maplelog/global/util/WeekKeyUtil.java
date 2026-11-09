package com.maplelog.maplelog.global.util;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

public class WeekKeyUtil {

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    private WeekKeyUtil() {}

    // 메이플스토리 주간 기준: 목요일 00:00 초기화
    // 주어진 날짜가 속한 메이플 주의 시작 목요일 날짜를 반환
    public static String getCurrentWeekKey() {
        return getWeekKey(LocalDate.now());
    }

    public static String getWeekKey(LocalDate date) {
        int daysFromThursday = (date.getDayOfWeek().getValue() - DayOfWeek.THURSDAY.getValue() + 7) % 7;
        LocalDate lastThursday = date.minusDays(daysFromThursday);
        return lastThursday.format(FORMATTER);
    }
}
