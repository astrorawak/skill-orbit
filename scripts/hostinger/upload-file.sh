#!/usr/bin/env bash
# upload-file.sh <local_file> <server_filename> <domain>
set -e
cd /tmp
UA="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120 Safari/537.36"
T="$HOSTINGER_API_TOKEN"
LOCAL="$1"; NAME="$2"; DOM="$3"
[ -f "$LOCAL" ] || { echo "not found: $LOCAL"; exit 1; }
SZ=$(stat -c%s "$LOCAL")
# fresh upload url
for i in 1 2 3 4 5; do
  R=$(curl -s -X POST "https://developers.hostinger.com/api/hosting/v1/files/upload-urls" -H "Authorization: Bearer $T" -H "User-Agent: $UA" -H "Content-Type: application/json" -d "{\"username\":\"u864726623\",\"domain\":\"$DOM\"}")
  URL=$(echo "$R" | python3 -c "import sys,json;print(json.load(sys.stdin).get('url',''))" 2>/dev/null)
  [ -n "$URL" ] && break
  sleep 2
done
[ -n "$URL" ] || { echo "no upload url"; exit 1; }
AK=$(echo "$R" | python3 -c "import sys,json;print(json.load(sys.stdin).get('auth_key',''))")
RK=$(echo "$R" | python3 -c "import sys,json;print(json.load(sys.stdin).get('rest_auth_key',''))")
CREATE="$(curl -s -i -X POST "${URL}/${NAME}?override=true" -H "User-Agent: $UA" -H "Tus-Resumable: 1.0.0" -H "X-Auth: $AK" -H "X-Auth-Rest: $RK" -H "Upload-Length: $SZ" -H "Upload-Offset: 0" | head -1)"
PATCH=$(curl -s -o /dev/null -w "%{http_code}" -X PATCH "${URL}/${NAME}?override=true" -H "User-Agent: $UA" -H "Tus-Resumable: 1.0.0" -H "X-Auth: $AK" -H "X-Auth-Rest: $RK" -H "Upload-Offset: 0" -H "Content-Type: application/offset+octet-stream" --data-binary @"$LOCAL")
echo "create=$CREATE patch=$PATCH file=$NAME size=$SZ"
[ "$PATCH" = "204" ] && echo "UPLOAD_OK" || echo "UPLOAD_ISSUE"
