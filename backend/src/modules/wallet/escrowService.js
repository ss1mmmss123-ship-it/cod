import { ethers } from 'ethers';
import { env } from '../../config/env.js';

const ABI = [
  'function createTable(bytes32 gameId,address token,uint256 buyIn,uint16 customFeeBps)',
  'function lockGame(bytes32 gameId)',
  'function settleGame(bytes32 gameId,address winner)'
];

const provider = new ethers.JsonRpcProvider(env.RPC_URL);

export function buildEscrowContract(signer) {
  return new ethers.Contract(env.BETTING_CONTRACT_ADDRESS, ABI, signer ?? provider);
}

export async function buildGameId(tableId) {
  return ethers.keccak256(ethers.toUtf8Bytes(`durak:${tableId}`));
}
