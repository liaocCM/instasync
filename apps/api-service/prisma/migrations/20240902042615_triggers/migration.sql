-- Trigger for User model
CREATE OR REPLACE FUNCTION update_user_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_timestamp
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_user_timestamp();

-- Trigger for Comment model
CREATE OR REPLACE FUNCTION update_comment_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_comment_timestamp
BEFORE UPDATE ON comments
FOR EACH ROW
EXECUTE FUNCTION update_comment_timestamp();

-- Trigger to hide comments when user is banned
CREATE OR REPLACE FUNCTION hide_comments_on_user_ban()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.banned = TRUE AND OLD.banned = FALSE THEN
        UPDATE comments
        SET hidden = TRUE
        WHERE user_id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER hide_comments_on_user_ban
AFTER UPDATE OF banned ON users
FOR EACH ROW
EXECUTE FUNCTION hide_comments_on_user_ban();

-- Trigger for Room model
CREATE OR REPLACE FUNCTION update_room_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_room_timestamp
BEFORE UPDATE ON rooms
FOR EACH ROW
EXECUTE FUNCTION update_room_timestamp();

-- Trigger to validate Room mode
CREATE OR REPLACE FUNCTION validate_room_mode()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.mode NOT IN ('VIDEO', 'PHOTO', 'MIXED') THEN
        RAISE EXCEPTION 'Invalid room mode. Must be VIDEO, PHOTO, or MIXED.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_room_mode
BEFORE INSERT OR UPDATE ON rooms
FOR EACH ROW
EXECUTE FUNCTION validate_room_mode();

-- Trigger to validate Comment type
CREATE OR REPLACE FUNCTION validate_comment_type()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.type NOT IN ('VIDEO', 'PHOTO') THEN
        RAISE EXCEPTION 'Invalid comment type. Must be either VIDEO or PHOTO.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_comment_type
BEFORE INSERT OR UPDATE ON comments
FOR EACH ROW
EXECUTE FUNCTION validate_comment_type();