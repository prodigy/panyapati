#!/bin/bash
PROJECT_NAME=panyapati
cd $(dirname ${BASH_SOURCE[0]})
export BINANCE_API_KEY=$(cat binance.key)
export BINANCE_API_SECRET=$(cat binance.secret)
docker compose -p $PROJECT_NAME build --pull
docker compose -p $PROJECT_NAME up
