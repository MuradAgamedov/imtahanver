<?php
/**
 * Shared MySQL connection for direct-PDO homepage content (Features, FAQ,
 * About, etc.) — no HTTP hop through the API. Callers must catch Throwable
 * and fall back to hardcoded content if the database is unreachable.
 */
function imtahanver_db(): PDO {
    return new PDO(
        'mysql:host=db;port=3306;dbname=imtahanver;charset=utf8mb4',
        'imtahanver_user',
        'imtahanver_password',
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_TIMEOUT => 2]
    );
}
