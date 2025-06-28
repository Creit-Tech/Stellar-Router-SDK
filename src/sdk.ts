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
import { type Invocation, SIMULATION_ACCOUNT, StellarRouterContract, type StellarRouterParams } from "./types.ts";

export class StellarRouterSdk {
  constructor(public params?: StellarRouterParams) {}

  /**
   * This method generates the InvokeHostFunction Operation that you will be able to use within your transactions
   * @param caller - The address that is calling the contract, this account must authorize the transaction even if none of the invocations require authorization.
   * @param invocations - All the invocations the proxy will execute
   */
  exec(
    caller: Contract | Address | string,
    invocations: Invocation[],
  ): xdr.Operation<Operation.InvokeHostFunction> {
    return new Contract(this.params?.routerContract || StellarRouterContract.v0).call(
      "exec",
      new Address(caller.toString()).toScVal(),
      xdr.ScVal.scvVec(invocations.map((invocation) =>
        xdr.ScVal.scvVec([
          new Address(invocation.contract.toString()).toScVal(),
          xdr.ScVal.scvSymbol(invocation.method),
          xdr.ScVal.scvVec(invocation.args),
        ])
      )),
    );
  }

  async simResult<T>(invocations: Invocation[], opts?: { source?: string }): Promise<T> {
    if (!this.params?.rpcUrl) {
      throw new Error("No `rpcUrl` parameter was provided to the SDK.");
    }

    const tx: Transaction = new TransactionBuilder(
      new Account(opts?.source || SIMULATION_ACCOUNT, "0"),
      { networkPassphrase: Networks.PUBLIC, fee: "0" },
    ).setTimeout(0)
      .addOperation(this.exec(SIMULATION_ACCOUNT, invocations))
      .build();

    const sim = await new rpc.Server(this.params.rpcUrl, { allowHttp: true })
      .simulateTransaction(tx);

    if (rpc.Api.isSimulationError(sim)) throw sim.error;

    return scValToNative(sim.result?.retval!);
  }
}
