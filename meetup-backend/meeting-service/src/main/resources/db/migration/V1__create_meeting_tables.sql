CREATE TABLE meetings (
    id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    tween_id UUID NOT NULL,
    created_by UUID NOT NULL,
    scheduled_at TIMESTAMPTZ NOT NULL,
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    status VARCHAR(32) NOT NULL,
    max_participants INTEGER,
    stream_call_id VARCHAR(255),
    stream_call_type VARCHAR(100),
    stream_call_created BOOLEAN NOT NULL DEFAULT FALSE,
    stream_channel_id VARCHAR(255),
    stream_channel_type VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE meeting_participants (
    id UUID PRIMARY KEY,
    meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    role VARCHAR(32) NOT NULL,
    joined_at TIMESTAMPTZ NOT NULL
);

CREATE UNIQUE INDEX ux_meeting_participants_meeting_user
    ON meeting_participants(meeting_id, user_id);

CREATE INDEX ix_meeting_participants_meeting_id
    ON meeting_participants(meeting_id);

CREATE TABLE meeting_chat_messages (
    id UUID PRIMARY KEY,
    meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    sent_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX ix_meeting_chat_messages_meeting_id
    ON meeting_chat_messages(meeting_id);

CREATE INDEX ix_meeting_chat_messages_sent_at
    ON meeting_chat_messages(sent_at);

CREATE TABLE transcript_segments (
    id UUID PRIMARY KEY,
    meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    speaker_id UUID,
    speaker_name VARCHAR(255),
    text TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL
);

CREATE INDEX ix_transcript_segments_meeting_id
    ON transcript_segments(meeting_id);

CREATE TABLE meeting_decisions (
    id UUID PRIMARY KEY,
    meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX ix_meeting_decisions_meeting_id
    ON meeting_decisions(meeting_id);

CREATE INDEX ix_meetings_scheduled_at
    ON meetings(scheduled_at);
