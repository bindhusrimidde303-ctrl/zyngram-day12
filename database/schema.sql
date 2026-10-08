-- Zyngram Day 10 Database Schema

CREATE TABLE Users (
    id INTEGER PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Customers (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    mobile VARCHAR(20) NOT NULL,
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    location_accuracy DECIMAL(10, 2),
    status VARCHAR(30) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id)
);

CREATE TABLE FranchiseOwners (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    kyc_status VARCHAR(30) DEFAULT 'PENDING',
    franchise_type VARCHAR(50),
    franchise_level VARCHAR(50),
    parent_franchise_id INTEGER,
    approval_status VARCHAR(30) DEFAULT 'PENDING',
    effective_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id)
);

CREATE TABLE Franchises (
    id INTEGER PRIMARY KEY,
    owner_id INTEGER NOT NULL,
    franchise_level VARCHAR(50) NOT NULL,
    name VARCHAR(150) NOT NULL,
    parent_franchise_id INTEGER,
    status VARCHAR(30) DEFAULT 'ACTIVE',
    FOREIGN KEY (owner_id) REFERENCES FranchiseOwners(id)
);

CREATE TABLE GeoBoundaries (
    id INTEGER PRIMARY KEY,
    franchise_id INTEGER NOT NULL,
    boundary_name VARCHAR(150),
    boundary_data TEXT NOT NULL,
    mapping_version VARCHAR(50) NOT NULL,
    status VARCHAR(30) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (franchise_id) REFERENCES Franchises(id)
);

CREATE TABLE UserLocations (
    id INTEGER PRIMARY KEY,
    customer_id INTEGER NOT NULL,
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    accuracy DECIMAL(10, 2),
    address TEXT,
    city VARCHAR(100),
    district VARCHAR(100),
    state VARCHAR(100),
    captured_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES Customers(id)
);

CREATE TABLE Services (
    id INTEGER PRIMARY KEY,
    service_name VARCHAR(100) NOT NULL,
    status VARCHAR(30) DEFAULT 'ACTIVE'
);

CREATE TABLE Operators (
    id INTEGER PRIMARY KEY,
    operator_name VARCHAR(100) NOT NULL,
    status VARCHAR(30) DEFAULT 'ACTIVE'
);

CREATE TABLE RechargeOrders (
    id INTEGER PRIMARY KEY,
    customer_id INTEGER NOT NULL,
    mobile_number VARCHAR(20) NOT NULL,
    operator_id INTEGER NOT NULL,
    circle_region VARCHAR(100),
    amount DECIMAL(12, 2) NOT NULL,
    status VARCHAR(30) DEFAULT 'CREATED',
    idempotency_key VARCHAR(150) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    confirmed_at TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES Customers(id),
    FOREIGN KEY (operator_id) REFERENCES Operators(id)
);

CREATE TABLE OrderAttributions (
    id INTEGER PRIMARY KEY,
    order_id INTEGER NOT NULL UNIQUE,
    customer_id INTEGER NOT NULL,
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    point_id INTEGER,
    center_id INTEGER,
    hub_id INTEGER,
    command_id INTEGER,
    mapping_version VARCHAR(50),
    commission_rule_version VARCHAR(50),
    attribution_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES RechargeOrders(id),
    FOREIGN KEY (customer_id) REFERENCES Customers(id)
);

CREATE TABLE CommissionRules (
    id INTEGER PRIMARY KEY,
    service_id INTEGER,

    franchise_level VARCHAR(50) NOT NULL,
    rate DECIMAL(8, 4) NOT NULL,
    rule_version VARCHAR(50) NOT NULL,
    status VARCHAR(30) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (service_id) REFERENCES Services(id)
);

CREATE TABLE CommissionLedger (
    id INTEGER PRIMARY KEY,
    order_id INTEGER NOT NULL,
    owner_id INTEGER NOT NULL,
    franchise_level VARCHAR(50) NOT NULL,
    rule_id INTEGER NOT NULL,
    rate DECIMAL(8, 4) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    status VARCHAR(30) DEFAULT 'CALCULATED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES RechargeOrders(id),
    FOREIGN KEY (owner_id) REFERENCES FranchiseOwners(id),
    FOREIGN KEY (rule_id) REFERENCES CommissionRules(id)
);

CREATE TABLE WalletLedger (
    id INTEGER PRIMARY KEY,
    transaction_id VARCHAR(100) UNIQUE NOT NULL,
    order_id INTEGER NOT NULL,
    owner_id INTEGER NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    transaction_type VARCHAR(50) NOT NULL,
    status VARCHAR(30) DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES RechargeOrders(id),
    FOREIGN KEY (owner_id) REFERENCES FranchiseOwners(id)
);

CREATE TABLE AIInsights (
    id INTEGER PRIMARY KEY,
    customer_id INTEGER,
    insight_type VARCHAR(100),
    insight TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE AIRecommendations (
    id INTEGER PRIMARY KEY,
    customer_id INTEGER,
    service_id INTEGER,
    recommendation TEXT NOT NULL,
    reason TEXT,
    next_action TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE AIAnomalies (
    id INTEGER PRIMARY KEY,
    anomaly_type VARCHAR(100) NOT NULL,
    severity VARCHAR(30) NOT NULL,
    order_id INTEGER,
    reason TEXT NOT NULL,
    detection_method VARCHAR(100),
    recommended_action TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE AuditLogs (
    id INTEGER PRIMARY KEY,
    user_id INTEGER,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id INTEGER,
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);










-- ============================================
-- ZYNORA DAY 11 - KNOWLEDGE BASE
-- ============================================

CREATE TABLE KnowledgeDocuments (
    id INTEGER PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    category VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    source VARCHAR(255),
    version VARCHAR(50) NOT NULL,
    status VARCHAR(30) DEFAULT 'DRAFT',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE KnowledgeChunks (
    id INTEGER PRIMARY KEY,
    document_id INTEGER NOT NULL,
    chunk_index INTEGER NOT NULL,
    title VARCHAR(200),
    category VARCHAR(100),
    section VARCHAR(200),
    version VARCHAR(50),
    source VARCHAR(255),
    status VARCHAR(30) DEFAULT 'DRAFT',
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (document_id) REFERENCES KnowledgeDocuments(id)
);