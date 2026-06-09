#!/bin/sh
set -e

# Copy .env.example to .env if not exists
if [ ! -f .env ]; then
    echo "Creating .env from .env.example..."
    cp .env.example .env
fi

# Run composer install if vendor/elastic is missing
if [ ! -d vendor/elastic ]; then
    echo "Installing Composer dependencies (found missing elasticsearch client)..."
    composer install --no-interaction --prefer-dist
fi

# Run key generate if APP_KEY is empty
if ! grep -q "APP_KEY=base64" .env; then
    echo "Generating application key..."
    php artisan key:generate --force
fi

# Wait for DB to be ready
echo "Waiting for database connection..."
php -r "
\$env = [];
if (file_exists('.env')) {
    foreach (file('.env') as \$line) {
        \$line = trim(\$line);
        if (\$line && strpos(\$line, '=') !== false && strpos(\$line, '#') !== 0) {
            list(\$key, \$value) = explode('=', \$line, 2);
            \$value = trim(\$value, '\"'\'' ');
            \$env[trim(\$key)] = \$value;
        }
    }
}

\$host = \$env['DB_HOST'] ?? getenv('DB_HOST') ?: '127.0.0.1';
\$port = \$env['DB_PORT'] ?? getenv('DB_PORT') ?: '3306';
\$db   = \$env['DB_DATABASE'] ?? getenv('DB_DATABASE') ?: 'forge';
\$user = \$env['DB_USERNAME'] ?? getenv('DB_USERNAME') ?: 'forge';
\$pass = \$env['DB_PASSWORD'] ?? getenv('DB_PASSWORD') ?: '';
\$conn = \$env['DB_CONNECTION'] ?? getenv('DB_CONNECTION') ?: 'mysql';

\$max_attempts = 30;
\$attempts = 0;

while (\$attempts < \$max_attempts) {
    try {
        if (\$conn === 'pgsql') {
            \$dsn = \"pgsql:host=\$host;port=\$port;dbname=\$db\";
        } else {
            \$dsn = \"mysql:host=\$host;port=\$port;dbname=\$db\";
        }
        \$pdo = new PDO(\$dsn, \$user, \$pass);
        echo \"Connected to database successfully\n\";
        exit(0);
    } catch (PDOException \$e) {
        echo \"Database connection failed, retrying... (\$conn:host=\$host;port=\$port;dbname=\$db) \" . \$e->getMessage() . \"\n\";
        sleep(2);
        \$attempts++;
    }
}
exit(1);
"

# Run migrations
echo "Running migrations..."
php artisan migrate --force

# Create storage symlink
echo "Creating storage symlink..."
php artisan storage:link --force

# Execute the main command
exec "$@"
