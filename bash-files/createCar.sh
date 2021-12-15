#!/bin/bash

# export environment variables from .env file
export $(xargs < ../.env)

##########################################################
#                    Input Variables
##########################################################

username=$1
orgName=$2  # MUST be in lowerCase
orgNumber=$3
id=$4
make=$5
model=$6
colour=$7
owner=$8


##########################################################
#               Paths, Addresses and Ports
##########################################################

# select proper $addr_peer0 from environment variables
select_addr_peer0="addr_${orgName}_peer0"  
peer0_addr=${!select_addr_peer0}

# select proper $peer0_port from environment variables
selectPeer0Port="port_${orgName}_peer0"  
peer0_port=${!selectPeer0Port}

# select proper $path_org_users_in_cli from environment variables
select_path_org_users_in_cli="path_${orgName}_users_in_cli"  
path_org_users_in_cli=${!select_path_org_users_in_cli}


CORE_PEER_MSPCONFIGPATH="$path_org_users_in_cli/$username@$orgName.example.com/msp"
CORE_PEER_ADDRESS=$peer0_addr:$peer0_port
VERSION="1"


##########################################################
#               Add the asset to the Ledger
##########################################################

cat << EOF | docker exec --interactive cli bash

    export CORE_PEER_MSPCONFIGPATH=$CORE_PEER_MSPCONFIGPATH
    export CORE_PEER_ADDRESS=$CORE_PEER_ADDRESS
    export ORDERER_CA=$path_orderer_tls_ca
    export VERSION=$VERSION

    peer chaincode invoke -o $addr_orderer1:$port_orderer1 --ordererTLSHostnameOverride $addr_orderer1 \
    --tls --cafile $path_orderer_msp_ca -C $channelName -n $chaincodeName \
    --peerAddresses $addr_org1_peer0:$port_org1_peer0 --tlsRootCertFiles $path_tlsRootCertFiles_org1 \
    --peerAddresses $addr_org2_peer0:$port_org2_peer0 --tlsRootCertFiles $path_tlsRootCertFiles_org2 \
    --peerAddresses $addr_org3_peer0:$port_org3_peer0 --tlsRootCertFiles $path_tlsRootCertFiles_org3 \
    --peerAddresses $addr_org4_peer0:$port_org4_peer0 --tlsRootCertFiles $path_tlsRootCertFiles_org4 \
    --peerAddresses $addr_org5_peer0:$port_org5_peer0 --tlsRootCertFiles $path_tlsRootCertFiles_org5 \
    --peerAddresses $addr_org6_peer0:$port_org6_peer0 --tlsRootCertFiles $path_tlsRootCertFiles_org6 \
    --peerAddresses $addr_org7_peer0:$port_org7_peer0 --tlsRootCertFiles $path_tlsRootCertFiles_org7 \
    --peerAddresses $addr_org8_peer0:$port_org8_peer0 --tlsRootCertFiles $path_tlsRootCertFiles_org8 \
    --peerAddresses $addr_org9_peer0:$port_org9_peer0 --tlsRootCertFiles $path_tlsRootCertFiles_org9 \
    --peerAddresses $addr_org10_peer0:$port_org10_peer0 --tlsRootCertFiles $path_tlsRootCertFiles_org10 \
    -c '{"function": "createCar", "Args":["$id", "$make", "$model", "$colour", "$owner"]}'

EOF
