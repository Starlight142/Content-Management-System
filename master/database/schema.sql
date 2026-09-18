-- 1. USER & TEAM
CREATE TABLE user_role (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE, -- 'ADMIN', 'MANAGER', 'MEMBER'
    description TEXT
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    role_id INT REFERENCES user_role(id),
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE team (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE team_member (
    team_id INT REFERENCES team(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    role_in_team VARCHAR(50), -- e.g., 'LEAD', 'EDITOR', 'CREATOR'
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (team_id, user_id)
);

-- 2. IDEA
CREATE TABLE idea_category (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE idea (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category_id INT REFERENCES idea_category(id),
    proposed_by INT REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'DRAFT', -- DRAFT, APPROVED, REJECTED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. CONTENT & METRICS
CREATE TABLE content_category (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE content (
    id SERIAL PRIMARY KEY,
    idea_id INT REFERENCES idea(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category_id INT REFERENCES content_category(id),
    status VARCHAR(50) DEFAULT 'PLANNING', -- PLANNING, PRODUCTION, REVIEW, APPROVED, PUBLISHED
    created_by INT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE content_platform (
    id SERIAL PRIMARY KEY,
    content_id INT REFERENCES content(id) ON DELETE CASCADE,
    platform_name VARCHAR(50) NOT NULL -- 'TikTok', 'YouTube', 'Instagram'
);

CREATE TABLE content_file (
    id SERIAL PRIMARY KEY,
    content_id INT REFERENCES content(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    file_type VARCHAR(50), -- 'VIDEO', 'IMAGE', 'DOCUMENT'
    uploaded_by INT REFERENCES users(id),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE content_metric (
    id SERIAL PRIMARY KEY,
    content_id INT REFERENCES content(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL,
    collected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    views INT DEFAULT 0,
    likes INT DEFAULT 0,
    comments INT DEFAULT 0,
    shares INT DEFAULT 0,
    watch_time INT DEFAULT 0,
    average_view_duration DECIMAL(10,2) DEFAULT 0.0,
    engagement_rate DECIMAL(5,2) DEFAULT 0.0,
    followers_gained INT DEFAULT 0
);

-- 4. TASKS
CREATE TABLE task_type (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL -- e.g., 'SCRIPTING', 'FILMING', 'EDITING'
);

CREATE TABLE task (
    id SERIAL PRIMARY KEY,
    content_id INT REFERENCES content(id) ON DELETE CASCADE,
    task_type_id INT REFERENCES task_type(id),
    assigned_to INT REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'TODO', -- TODO, IN_PROGRESS, REVIEW, DONE
    due_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. LEGAL & COMPLIANCE
CREATE TABLE legal_category (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT
);

CREATE TABLE legal_article (
    id SERIAL PRIMARY KEY,
    category_id INT REFERENCES legal_category(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content TEXT,
    source VARCHAR(255),
    effective_date TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE content_legal_check (
    id SERIAL PRIMARY KEY,
    content_id INT REFERENCES content(id) ON DELETE CASCADE,
    legal_article_id INT REFERENCES legal_article(id),
    status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, PASSED, FAILED, N/A
    note TEXT,
    checked_by INT REFERENCES users(id),
    checked_at TIMESTAMP
);

-- 6. ANALYTICS & TRENDS (Intelligence)
CREATE TABLE trend (
    id SERIAL PRIMARY KEY,
    topic VARCHAR(255) NOT NULL,
    trend_growth DECIMAL(5,2), -- Percentage growth e.g., 38.00 (+38%)
    trend_score INT, -- Internal score out of 100
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE recommendation (
    id SERIAL PRIMARY KEY,
    topic VARCHAR(255),
    format VARCHAR(100),
    platform VARCHAR(50),
    reason TEXT,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

