#!/bin/sh

echo "Waiting for Grafana API..."

until curl -s http://$GRAFANA_ADMIN_USER:$GRAFANA_ADMIN_PASSWORD@localhost:3000/api/health > /dev/null; do
  echo "Grafana not ready..."
  sleep 5
done

echo "Grafana ready."


# Create Viewer


curl -u $GRAFANA_ADMIN_USER:$GRAFANA_ADMIN_PASSWORD -X POST http://localhost:3000/api/admin/users \
-H "Content-Type: application/json" \
-d '{
  "name":"viewer-user",
  "email":"viewer@gmail.com",
  "login":"viewer",
  "password":"viewer123"
}'

echo "Viewer created"

# Get Viewer ID

VIEWER_ID=$(curl -s -u $GRAFANA_ADMIN_USER:$GRAFANA_ADMIN_PASSWORD http://localhost:3000/api/users/lookup?loginOrEmail=viewer | grep -o '"id":[0-9]*' | grep -o '[0-9]*')

echo "Viewer ID: $VIEWER_ID"

# Assign Role

curl -u $GRAFANA_ADMIN_USER:$GRAFANA_ADMIN_PASSWORD -X PATCH http://localhost:3000/api/org/users/$VIEWER_ID \
-H "Content-Type: application/json" \
-d '{
  "role":"Viewer"
}'

echo "Viewer role assigned"


# Create Editor


curl -u $GRAFANA_ADMIN_USER:$GRAFANA_ADMIN_PASSWORD -X POST http://localhost:3000/api/admin/users \
-H "Content-Type: application/json" \
-d '{
  "name":"editor-user",
  "email":"editor@gmail.com",
  "login":"editor",
  "password":"editor123"
}'

echo "Editor created"

# Get Editor ID

EDITOR_ID=$(curl -s -u $GRAFANA_ADMIN_USER:$GRAFANA_ADMIN_PASSWORD http://localhost:3000/api/users/lookup?loginOrEmail=editor | grep -o '"id":[0-9]*' | grep -o '[0-9]*')

echo "Editor ID: $EDITOR_ID"

# Assign Role

curl -u $GRAFANA_ADMIN_USER:$GRAFANA_ADMIN_PASSWORD -X PATCH http://localhost:3000/api/org/users/$EDITOR_ID \
-H "Content-Type: application/json" \
-d '{
  "role":"Editor"
}'

echo "Editor role assigned"

echo "All users created successfully"