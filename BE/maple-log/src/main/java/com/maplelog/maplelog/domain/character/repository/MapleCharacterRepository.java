package com.maplelog.maplelog.domain.character.repository;

import com.maplelog.maplelog.domain.character.entity.MapleCharacter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface MapleCharacterRepository extends JpaRepository<MapleCharacter, Long> {
    List<MapleCharacter> findAllByMemberId(Long memberId);
    List<MapleCharacter> findAllByMemberIdOrderBySortOrderAsc(Long memberId);
    int countByMemberId(Long memberId);
    Optional<MapleCharacter> findByMemberIdAndIsMainTrue(Long memberId);
    Optional<MapleCharacter> findByMemberIdAndOcid(Long memberId, String ocid);
    boolean existsByMemberIdAndOcid(Long memberId, String ocid);

    @Query("SELECT c FROM MapleCharacter c JOIN FETCH c.member WHERE c.member.nexonAccessToken IS NOT NULL OR c.member.apiKey IS NOT NULL")
    List<MapleCharacter> findAllWithMember();
}
