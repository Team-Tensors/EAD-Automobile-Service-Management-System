package com.ead.backend.repository;

import com.ead.backend.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, UUID> {

    @Query("SELECT cm FROM ChatMessage cm WHERE cm.chatRoom.chatRoomId = :chatRoomId ORDER BY cm.sentAt ASC")
    List<ChatMessage> findAllByChatRoomId(@Param("chatRoomId") UUID chatRoomId);

    @Query("SELECT COUNT(cm) FROM ChatMessage cm WHERE cm.chatRoom.chatRoomId = :chatRoomId AND cm.sender.id != :userId AND cm.isRead = false")
    Integer countUnreadMessages(@Param("chatRoomId") UUID chatRoomId, @Param("userId") UUID userId);

    @Query("SELECT cm FROM ChatMessage cm WHERE cm.chatRoom.chatRoomId = :chatRoomId AND cm.sender.id != :senderId AND cm.isRead = false")
    List<ChatMessage> findUnreadMessages(@Param("chatRoomId") UUID chatRoomId, @Param("senderId") UUID senderId);
}

