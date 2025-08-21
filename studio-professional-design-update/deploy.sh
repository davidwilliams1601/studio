set -euo pipefail
: "${STRIPE_SECRET_KEY:?Set STRIPE_SECRET_KEY in your environment}"
echo "Deploying with STRIPE_SECRET_KEY set (value not printed)"
