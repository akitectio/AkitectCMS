package io.akitect.cms.dto;

import java.time.LocalDateTime;
import java.util.UUID;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Schema(description = "Post revision data transfer object")
public class PostRevisionDTO {

    @Schema(description = "The unique identifier of the revision")
    private UUID id;

    @Schema(description = "The unique identifier of the post this revision belongs to")
    private UUID postId;

    @Schema(description = "The revision number")
    private int revisionNumber;

    @Schema(description = "The title of the post at this revision")
    private String title;

    @Schema(description = "The content of the post at this revision")
    private String content;

    @Schema(description = "The excerpt of the post at this revision")
    private String excerpt;

    @Schema(description = "The date and time when this revision was created")
    private LocalDateTime createdAt;

    @Schema(description = "The user who created this revision")
    private String createdByUsername;

    @Schema(description = "The full name of the user who created this revision")
    private String createdByFullName;

    @Schema(description = "The ID of the user who created this revision")
    private UUID createdById;
}