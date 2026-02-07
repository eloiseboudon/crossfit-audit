#!/bin/bash

echo "🔍 Recherche des magic strings..."

# Backend
echo ""
echo "📦 Backend:"
grep -r "'draft'" backend/models backend/controllers backend/utils --exclude-dir=node_modules || echo "✅ 'draft' OK"
grep -r "'admin'" backend/middleware backend/controllers --exclude-dir=node_modules || echo "✅ 'admin' OK"
grep -r "'P1'" backend/utils --exclude-dir=node_modules || echo "✅ 'P1' OK"

# Frontend
echo ""
echo "🎨 Frontend:"
grep -r "'draft'" src/pages src/components --exclude-dir=node_modules || echo "✅ 'draft' OK"
grep -r "#48737F" src/pages src/components --exclude-dir=node_modules || echo "✅ Colors OK"

echo ""
echo "✅ Vérification terminée!"
