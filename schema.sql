CREATE TABLE IF NOT EXISTS listings(
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 title TEXT NOT NULL,
 type TEXT NOT NULL CHECK(type IN('sale','rent')),
 category TEXT NOT NULL CHECK(category IN('konut','arsa','isyeri','vasita')),
 status TEXT NOT NULL DEFAULT 'active' CHECK(status IN('active','sold','rented')),
 price INTEGER NOT NULL DEFAULT 0,
 city TEXT, district TEXT, hood TEXT, address TEXT,
 area INTEGER,
 attrs TEXT NOT NULL DEFAULT '{}',
 images TEXT NOT NULL DEFAULT '[]',
 agent TEXT NOT NULL DEFAULT 'Rasim Erdem',
 description TEXT,
 views INTEGER NOT NULL DEFAULT 0,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_l ON listings(type,category,status);
CREATE TABLE IF NOT EXISTS leads(
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 kind TEXT, name TEXT, phone TEXT, note TEXT, listing_id INTEGER,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS locations(
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 city TEXT NOT NULL, district TEXT NOT NULL, hood TEXT NOT NULL DEFAULT '',
 UNIQUE(city,district,hood)
);
INSERT OR IGNORE INTO locations(city,district,hood) VALUES
 ('Siirt','Merkez',''),('Siirt','Aydınlar',''),('Siirt','Baykan',''),('Siirt','Eruh',''),
 ('Siirt','Kurtalan',''),('Siirt','Pervari',''),('Siirt','Şirvan','');

CREATE TABLE IF NOT EXISTS settings(k TEXT PRIMARY KEY, v TEXT NOT NULL);
