#!/bin/sh

if [ "${DATABASE_URL}" ]; then
  if [[ "${DATABASE_URL}" == *\?* ]]
  then
    export STACKS_API_POSTGRES="${DATABASE_URL}&schema=stacks_blockchain_api&connection_limit=25&pool_timeout=15"
  else
    export STACKS_API_POSTGRES="${DATABASE_URL}?schema=stacks_blockchain_api&connection_limit=25&pool_timeout=15"
  fi
fi

if [ "${BNSX_DB_URL}" ]; then
  if [[ "${BNSX_DB_URL}" == *\?* ]]
  then
    export BNSX_DB_URL="${BNSX_DB_URL}&connection_limit=25&pool_timeout=15"
  else
    export BNSX_DB_URL="${BNSX_DB_URL}?connection_limit=25&pool_timeout=15"
  fi
  
fi


echo "Starting API"

echo "PORT $PORT"

exec pnpm api:prod