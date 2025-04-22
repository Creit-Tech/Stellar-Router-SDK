import type { Address, xdr } from "@stellar/stellar-sdk";

export const SIMULATION_ACCOUNT: string = "GALAXYVOIDAOPZTDLHILAJQKCVVFMD4IKLXLSZV5YHO7VY74IWZILUTO";

export enum StellarRouterContract {
  v0 = "CBZV3HBP672BV7FF3ZILVT4CNPW3N5V2WTJ2LAGOAYW5R7L2D5SLUDFZ",
}

export interface StellarRouterParams {
  rpcUrl?: string;
  routerContract?: string;
}

export interface Invocation {
  contract: Address | string;
  method: string;
  args: xdr.ScVal[];
}
