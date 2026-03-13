ALTER TABLE app_user
ADD COLUMN reset_password_token VARCHAR(100);

ALTER TABLE app_user
ADD COLUMN reset_password_token_expiry TIMESTAMP;

