CREATE TABLE user (
    id VARCHAR(15) PRIMARY KEY,
    name VARCHAR(31) NOT NULL,
    email VARCHAR(31),
    image VARCHAR(255)
);

CREATE TABLE user_key (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(15) NOT NULL,
    hashed_password VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES user(id)
);

CREATE TABLE user_session (
    id VARCHAR(127) PRIMARY KEY,
    user_id VARCHAR(15) NOT NULL,
    access_token VARCHAR(255) NOT NULL,
    refresh_token VARCHAR(255),
    active_expires BIGINT NOT NULL,
    idle_expires BIGINT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user(id)
);