package io.akitect.cms.util;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

import org.apache.commons.io.FilenameUtils;
import org.springframework.web.multipart.MultipartFile;

import io.akitect.cms.exception.custom.StorageException;

/**
 * Utility class for file operations.
 */
public class FileUtil {
    
    private FileUtil() {
        // Private constructor to prevent instantiation
    }
    
    /**
     * Generate a unique filename based on the original filename.
     *
     * @param originalFilename The original filename
     * @return A unique filename
     */
    public static String generateUniqueFilename(String originalFilename) {
        String extension = FilenameUtils.getExtension(originalFilename);
        return UUID.randomUUID().toString() + (extension.isEmpty() ? "" : "." + extension);
    }
    
    /**
     * Create a directory structure for storing files based on the current date.
     *
     * @param baseDir The base directory
     * @return The path string including date-based subdirectories
     */
    public static String createDateBasedDirectory(String baseDir) {
        LocalDateTime now = LocalDateTime.now();
        String datePath = now.format(DateTimeFormatter.ofPattern("yyyy/MM/dd"));
        String dirPath = baseDir + File.separator + datePath;
        
        try {
            Path path = Paths.get(dirPath);
            Files.createDirectories(path);
            return datePath;
        } catch (IOException e) {
            throw new StorageException("Failed to create directory: " + dirPath, e);
        }
    }
    
    /**
     * Save a MultipartFile to the specified directory.
     *
     * @param file The file to save
     * @param directory The directory path
     * @param filename The filename to use
     * @return The complete path where the file was saved
     */
    public static String saveFile(MultipartFile file, String directory, String filename) {
        try {
            Path dirPath = Paths.get(directory);
            if (!Files.exists(dirPath)) {
                Files.createDirectories(dirPath);
            }
            
            Path filePath = dirPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath);
            
            return filePath.toString();
        } catch (IOException e) {
            throw new StorageException("Failed to save file: " + filename, e);
        }
    }
    
    /**
     * Get the MIME type of a file.
     *
     * @param file The file
     * @return The MIME type string
     */
    public static String getMimeType(File file) {
        try {
            return Files.probeContentType(file.toPath());
        } catch (IOException e) {
            return "application/octet-stream"; // Default MIME type
        }
    }
    
    /**
     * Delete a file at the specified path.
     *
     * @param filePath The path of the file to delete
     * @return true if successful, false otherwise
     */
    public static boolean deleteFile(String filePath) {
        try {
            Path path = Paths.get(filePath);
            return Files.deleteIfExists(path);
        } catch (IOException e) {
            throw new StorageException("Failed to delete file: " + filePath, e);
        }
    }
}
