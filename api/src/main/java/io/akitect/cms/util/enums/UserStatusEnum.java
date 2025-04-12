package io.akitect.cms.util.enums;

/**
 * Enum for user status values
 */
public enum UserStatusEnum {
    ACTIVE("ACTIVE"),
    INACTIVE("INACTIVE"),
    SUSPENDED("SUSPENDED"),
    BANNED("BANNED"),
    PENDING("PENDING");

    private final String value;

    UserStatusEnum(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static UserStatusEnum fromValue(String value) {
        for (UserStatusEnum status : UserStatusEnum.values()) {
            if (status.value.equals(value)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Invalid user status: " + value);
    }
}