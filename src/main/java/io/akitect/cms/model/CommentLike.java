package io.akitect.cms.model;

import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "comment_likes")
@Getter
@Setter
@NoArgsConstructor
public class CommentLike implements Serializable {

    @EmbeddedId
    private CommentLikeId id;

    @ManyToOne
    @MapsId("commentId")
    @JoinColumn(name = "comment_id")
    private Comment comment;

    @ManyToOne
    @MapsId("userId")
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    // Constructor with comment and user
    public CommentLike(Comment comment, User user) {
        this.comment = comment;
        this.user = user;
        this.id = new CommentLikeId(comment.getId(), user.getId());
    }

    // Embedded ID class for composite primary key
    @Embeddable
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @EqualsAndHashCode
    public static class CommentLikeId implements Serializable {

        @Column(name = "comment_id")
        private UUID commentId;

        @Column(name = "user_id")
        private UUID userId;
    }
}