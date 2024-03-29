CREATE DATABASE IF NOT EXISTS $AUTH_DB_NAME DEFAULT CHARSET utf8mb4 DEFAULT COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS $DEVICE_DB_NAME DEFAULT CHARSET utf8mb4 DEFAULT COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS $EXPERIMENT_DB_NAME DEFAULT CHARSET utf8mb4 DEFAULT COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS $FEDERATION_DB_NAME DEFAULT CHARSET utf8mb4 DEFAULT COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS $UPDATE_DB_NAME DEFAULT CHARSET utf8mb4 DEFAULT COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS '$AUTH_DB_USERNAME'@'%' IDENTIFIED BY '$AUTH_DB_PASSWORD';
CREATE USER IF NOT EXISTS '$DEVICE_DB_USERNAME'@'%' IDENTIFIED BY '$DEVICE_DB_PASSWORD';
CREATE USER IF NOT EXISTS '$EXPERIMENT_DB_USERNAME'@'%' IDENTIFIED BY '$EXPERIMENT_DB_PASSWORD';
CREATE USER IF NOT EXISTS '$FEDERATION_DB_USERNAME'@'%' IDENTIFIED BY '$FEDERATION_DB_PASSWORD';
CREATE USER IF NOT EXISTS '$UPDATE_DB_USERNAME'@'%' IDENTIFIED BY '$UPDATE_DB_PASSWORD';

GRANT ALL PRIVILEGES ON $AUTH_DB_NAME.* to '$AUTH_DB_USERNAME'@'%';
GRANT ALL PRIVILEGES ON $DEVICE_DB_NAME.* to '$DEVICE_DB_USERNAME'@'%';
GRANT ALL PRIVILEGES ON $EXPERIMENT_DB_NAME.* to '$EXPERIMENT_DB_USERNAME'@'%';
GRANT ALL PRIVILEGES ON $FEDERATION_DB_NAME.* to '$FEDERATION_DB_USERNAME'@'%';
GRANT ALL PRIVILEGES ON $UPDATE_DB_NAME.* to '$UPDATE_DB_USERNAME'@'%';

FLUSH PRIVILEGES;