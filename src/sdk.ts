import {
  Account,
  Address,
  Contract,
  Networks,
  type Operation,
  rpc,
  scValToNative,
  type Transaction,
  TransactionBuilder,
  xdr,
} from "@stellar/stellar-sdk";

import {
  type InvocationV0,
  type InvocationV1,
  SIMULATION_ACCOUNT,
  StellarRouterContract,
  type StellarRouterParams,
} from "./types.ts";

export class StellarRouterSdk {
  public get simAccount(): string {
    return this.params?.simulationAccount || SIMULATION_ACCOUNT;
  }

  public get router(): Contract {
    return new Contract(this.params?.routerContract || StellarRouterContract.v0);
  }

  constructor(public params?: StellarRouterParams) {}

  /**
   * This method generates the InvokeHostFunction Operation that you will be able to use within your transactions
   * @param caller - The address that is calling the contract, this account must authorize the transaction even if none of the invocations require authorization.
   * @param invocations - All the invocations the proxy will execute
   */
  exec(
    caller: Contract | Address | string,
    invocations: (InvocationV1 | InvocationV0)[],
  ): xdr.Operation<Operation.InvokeHostFunction> {
    const args: xdr.ScVal[] = invocations.map((invocation) => {
      switch (invocation.version) {
        case "v0":
          return xdr.ScVal.scvVec([
            new Address(invocation.contract.toString()).toScVal(),
            xdr.ScVal.scvSymbol(invocation.method),
            xdr.ScVal.scvVec(invocation.args),
          ]);

        case "v1":
          return xdr.ScVal.scvVec([
            new Address(invocation.contract.toString()).toScVal(),
            xdr.ScVal.scvSymbol(invocation.method),
            xdr.ScVal.scvVec(invocation.args),
            xdr.ScVal.scvBool(invocation.canFail === true),
          ]);

        default:
          throw new Error(`Invocation version is not supported.`);
      }
    });

    return this.router.call("exec", new Address(caller.toString()).toScVal(), xdr.ScVal.scvVec(args));
  }

  async simResult<T>(
    invocations: (InvocationV1 | InvocationV0)[],
    opts?: { caller?: string; source?: string },
  ): Promise<T> {
    if (!this.params?.rpcUrl) {
      throw new Error("No `rpcUrl` parameter was provided to the SDK.");
    }

    const tx: Transaction = new TransactionBuilder(
      new Account(opts?.source || this.simAccount, "0"),
      { networkPassphrase: Networks.PUBLIC, fee: "0" },
    ).setTimeout(0)
      .addOperation(this.exec(opts?.caller || this.simAccount, invocations))
      .build();

    const sim = await new rpc.Server(this.params.rpcUrl, { allowHttp: true })
      .simulateTransaction(tx);

    if (rpc.Api.isSimulationError(sim)) throw sim.error;

    return scValToNative(sim.result?.retval!);
  }
}
