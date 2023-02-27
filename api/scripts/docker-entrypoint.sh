#!/bin/sh

if [ "${DATABASE_URL}" ]; then
  if [[ "${DATABASE_URL}" == *\?* ]]
  then
    export STACKS_API_POSTGRES="${DATABASE_URL}&schema=stacks_blockchain_api"
  else
    export STACKS_API_POSTGRES="${DATABASE_URL}?schema=stacks_blockchain_api"
  fi
  
fi

exec pnpm --filter @bns-x/api-types exec tsx scripts/server.ts