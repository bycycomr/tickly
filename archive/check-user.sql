-- Check all users
SELECT Id, Username, Email, TenantId, Status 
FROM Users 
WHERE Email LIKE '%bycycomr%' OR Username LIKE '%bycyc%';

-- Check all users if above returns nothing
SELECT Id, Username, Email, TenantId, Status 
FROM Users 
LIMIT 10;

-- Check tenant info
SELECT Id, Name FROM Tenants;
