#!/bin/bash

# List of files that need dynamic export added
files=(
  "src/app/api/test/email-debug/route.ts"
  "src/app/api/test/send-welcome-email/route.ts"
  "src/app/api/auth/session/route.ts"
  "src/app/api/subscription/manage/route.ts"
  "src/app/api/subscription/create/route.ts"
  "src/app/api/gdpr/delete-account/route.ts"
  "src/app/api/gdpr/export-data/route.ts"
  "src/app/api/team/invite/route.ts"
  "src/app/api/team/route.ts"
  "src/app/api/team/members/[memberId]/route.ts"
  "src/app/api/team/accept-invite/route.ts"
  "src/app/api/users/onboarding/route.ts"
  "src/app/api/webhooks/stripe/route.ts"
  "src/app/api/backups/[backupId]/process/route.ts"
)

for file in "${files[@]}"; do
  if [ -f "$file" ] && ! grep -q "export const dynamic" "$file"; then
    echo "Adding dynamic export to $file"
    # Add after imports, before first export or function
    sed -i '' '1,/^$/s/$/\n\nexport const dynamic = '\''force-dynamic'\'';/' "$file"
  fi
done

echo "Done!"
