#!/bin/bash
# Baut public/index.html aus den Quelldateien in src/ (alle *.js in Namensreihenfolge)
cd "$(dirname "$0")/src"
mkdir -p ../public
{ echo '<!doctype html><html lang="de"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">'; cat h_head.html; echo "<script>"; cat $(ls *.js | sort); echo "</script>"; } > ../public/index.html
node -e "const s=require('fs').readFileSync('../public/index.html','utf8');const m=s.match(/<script>([\s\S]*)<\/script>/)[1];try{new Function(m);console.log('syntax ok',(s.length/1024|0)+' KB')}catch(e){console.log('ERR',e.message);process.exit(1)}"
