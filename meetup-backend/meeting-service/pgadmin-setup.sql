CREATE USER meetup WITH PASSWORD 'meetup_password';

CREATE DATABASE meetup_meeting_service
    WITH
    OWNER = meetup
    ENCODING = 'UTF8'
    TEMPLATE = template0;

GRANT ALL PRIVILEGES ON DATABASE meetup_meeting_service TO meetup;
