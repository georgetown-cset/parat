npm install && gatsby clean && gatsby build && gsutil -m rsync -r -d public "gs://eto-tmp/eto-parat/public" && gsutil -m -h "Cache-Control:no-cache, max-age=0" rsync -r -d "gs://eto-tmp/eto-parat/public" "gs://parat.eto.tech/"