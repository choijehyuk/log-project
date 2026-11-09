package com.maplelog.maplelog.domain.member.repository;

import com.maplelog.maplelog.domain.member.entity.AuthType;
import com.maplelog.maplelog.domain.member.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MemberRepository extends JpaRepository<Member, Long> {
    Optional<Member> findByNexonId(String nexonId);
    Optional<Member> findByApiKey(String apiKey);
    Optional<Member> findByNicknameAndAuthType(String nickname, AuthType authType);
    boolean existsByNexonId(String nexonId);
    boolean existsByApiKey(String apiKey);
}
