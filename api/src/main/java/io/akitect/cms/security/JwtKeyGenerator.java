package io.akitect.cms.security;

import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import java.util.Base64;

/**
 * Utility class to generate secure JWT keys
 */
public class JwtKeyGenerator {

    /**
     * Generate a secure key for HS512 algorithm and encode it as Base64
     * This can be run once to generate a secure key for your application properties
     */
    public static String generateHS512Key() {
        return Base64.getEncoder().encodeToString(Keys.secretKeyFor(SignatureAlgorithm.HS512).getEncoded());
    }

    /**
     * Main method to generate and print a secure key
     * You can run this method separately to generate a new key for your application
     */
    public static void main(String[] args) {
        String secureKey = generateHS512Key();
        System.out.println("Generated secure key for JWT:");
        System.out.println(secureKey);
        System.out.println("Key length: " + secureKey.length() + " characters");
        System.out.println("Use this key in your application.properties file for akitect.app.jwtSecret");
    }
}