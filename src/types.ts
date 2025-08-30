import type { Address, xdr } from "@stellar/stellar-sdk";

export const SIMULATION_ACCOUNT: string = "GALAXYVOIDAOPZTDLHILAJQKCVVFMD4IKLXLSZV5YHO7VY74IWZILUTO";

export enum StellarRouterContract {
  v0 = "CBZV3HBP672BV7FF3ZILVT4CNPW3N5V2WTJ2LAGOAYW5R7L2D5SLUDFZ",
  v1 = "CCM23MFAJHDWUMF3IM3UPUI4ZUFFKX6OWJNJRUKO2W6MUTQNQWWFH7DC",
}

export interface StellarRouterParams {
  rpcUrl?: string;
  routerContract?: string;
  simulationAccount?: string;
}

export class InvocationV0 {
  contract: Address | string;
  method: string;
  args: xdr.ScVal[];

  version: "v0" = "v0";

  constructor(params: Omit<InvocationV0, "version">) {
    this.contract = params.contract;
    this.method = params.method;
    this.args = params.args;
  }
}

export class InvocationV1 {
  contract: Address | string;
  method: string;
  args: xdr.ScVal[];
  canFail?: boolean;

  version: "v1" = "v1";

  constructor(params: Omit<InvocationV1, "version">) {
    this.contract = params.contract;
    this.method = params.method;
    this.args = params.args;
    this.canFail = params.canFail;
  }
}
