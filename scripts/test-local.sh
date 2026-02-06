#!/bin/bash
# Test the API locally

ORG_ID="test-org-123"
BASE_URL="${1:-http://localhost:3000}"

echo "Testing API at $BASE_URL"
echo "Using org_id: $ORG_ID"
echo ""

# Test templates endpoint (no auth needed for list)
echo "1. GET /api/templates"
curl -s "$BASE_URL/api/templates" -H "x-org-id: $ORG_ID" | head -c 200
echo ""
echo ""

# Test specific template
echo "2. GET /api/templates/dental"
curl -s "$BASE_URL/api/templates/dental" -H "x-org-id: $ORG_ID" | head -c 200
echo ""
echo ""

# Test agents list (will fail without DB)
echo "3. GET /api/agents"
curl -s "$BASE_URL/api/agents" -H "x-org-id: $ORG_ID"
echo ""
echo ""

echo "Done!"
