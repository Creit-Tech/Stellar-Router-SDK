# Stellar Router SDK

The Stellar Router is a simple smart contract that you can use to execute multiple contract calls at the same time.

Why doing this? Well by doing this you can "simulate" the feature the classic side has where you could make multiple
operations at the same time, with soroban you are limited to a single operation per transaction but by using this router
you can make multiple soroban calls at once from your website.

## Install the SDK

You can install the SDK from JSR by doing:

```shell
npx jsr add @creit-tech/stellar-assets-sdk
```

You can check more installation methods (deno, pnpm, etc) from [here](https://jsr.io/@creit-tech/stellar-router-sdk/)

## Choose your contract to use

The first thing to take in consideration is the nature of these "Meta Contracts": they are simple immutable contracts,
so every time we add new features they will be in a separated contract. This allows you to use the one that fits your
use case and if for example the only thing you need to do is making an atomic call then using the V0 is the best choice.

If you want to use the contract V0 then you will use the `InvocationV0` class, while if you want to use the V1 then you
will use the `InvocationV1`. You can check the current versions available and what they do
[here](https://github.com/Creit-Tech/Stellar-Router-Contract).

## How to use

Because the library it's pretty simple, using it is also simple. Here is an example of us fetching a list of 19 balances
from different contracts calls at once (BUT, if you need to fetch balances like this, we suggest you using our
[Stellar Assets SDK](https://jsr.io/@creit-tech/stellar-assets-sdk) because it takes more stuff in consideration).

```typescript
import { InvocationV0, StellarRouterSdk } from "@creit-tech/stellar-router-sdk";

const assets: string[] = [
  "CAUIKL3IYGMERDRUN6YSCLWVAKIFG5Q4YJHUKM4S4NJZQIA3BAS6OJPK",
  "CD25MNVTZDL4Y3XBCPCJXGXATV5WUHHOWMYFF4YBEGU5FCPGMYTVG5JY",
  "CAO7DDJNGMOYQPRYDY5JVZ5YEK4UQBSMGLAEWRCUOTRMDSBMGWSAATDZ",
  "CBH4M45TQBLDPXOK6L7VYKMEJWFITBOL64BN3WDAIIDT4LNUTWTTOCKF",
  "CDTKPWPLOURQA2SGTKTUQOWRCBZEORB4BWBOMJ3D3ZTQQSGE5F6JBQLV",
  "CBN3NCJSMOQTC6SPEYK3A44NU4VS3IPKTARJLI3Y77OH27EWBY36TP7U",
  "CBCO65UOWXY2GR66GOCMCN6IU3Y45TXCPBY3FLUNL4AOUMOCKVIVV6JC",
  "CCKCKCPHYVXQD4NECBFJTFSCU2AMSJGCNG4O6K4JVRE2BLPR7WNDBQIQ",
  "CCW67TSZV3SSS2HXMBQ5JFGCKJNXKZM7UQUWUZPUTHXSTZLEO7SJMI75",
  "CB226ZOEYXTBPD3QEGABTJYSKZVBP2PASEISLG3SBMTN5CE4QZUVZ3CE",
  "CDIKURWHYS4FFTR5KOQK6MBFZA2K3E26WGBQI6PXBYWZ4XIOPJHDFJKP",
  "CAS3J7GYLGXMF6TDJBBYYSE3HQ6BBSMLNUQ34T6TZMYMW2EVH34XOWMA",
  "CBLLEW7HD2RWATVSMLAGWM4G3WCHSHDJ25ALP4DI6LULV5TU35N2CIZA",
  "CAAV3AE3VKD2P4TY7LWTQMMJHIJ4WOCZ5ANCIJPC3NRSERKVXNHBU2W7",
  "CDCKFBZYF2AQCSM3JOF2ZM27O3Y6AJAI4OTCQKAFNZ3FHBYUTFOKICIY",
  "CB2XMFB6BDIHFOSFB5IXHDOYV3SI3IXMNIZLPDZHC7ENDCXSBEBZAO2Y",
  "CBRP2VD3CZLEQIQZ4JMBXGA5AC2U6JE26YU5CCIOICIZCVWPGBO2QRUB",
  "CDYEOOVL6WV4JRY45CXQKOBJFFAPOM5KNQCCDNM333L6RM2L4RO3LKYG",
  "CBZVSNVB55ANF24QVJL2K5QCLOAB6XITGTGXYEAF6NPTXYKEJUYQOHFC",
];

const sdk: StellarRouterSdk = new StellarRouterSdk({ rpcUrl: "https://mainnet.sorobanrpc.com" });
const xbullSwapContract: string = "CB3JAPDEIMA3OOSALUHLYRGM2QTXGVD3EASALPFMVEU2POLLULJBT2XN";
const invocations: InvocationV0[] = assets.map((contract: string): InvocationV0 =>
  new InvocationV0({
    contract,
    method: "balance",
    args: [new Address(xbullSwapContract).toScVal()],
  })
);

const balances: bigint[] = await sdk.simResult(invocations);
```

But you can also generate the operations for you to use in your own transaction and execute them, here is an example of
burning and registering again a domain in the SorobanDomains contract (basically, doing a "renew" without the contract
directly supporting it).

```typescript
import { SorobanDomainsSDK } from "@creit-tech/sorobandomains-sdk";
import { InvocationV0, StellarRouterSdk } from "@creit-tech/stellar-router-sdk";
import { xdr } from "@stellar/stellar-sdk";

const routerSdk = new StellarRouterSdk();
const domainsSdk = new SorobanDomainsSDK(PARAMS);
const domain = "superawesomeimpossibledomain";
const domainsContract = "CATRNPHYKNXAPNLHEYH55REB6YSAJLGCPA4YM6L3WUKSZOPI77M2UMKI";
const domainOwner: string = "GA3S4HZCLBXSA4T5SFNLTQNZ4VOJM3V2H2EN57RJPYFS2BVXX2PEXGPO";

const { value } = await domainsSdk.searchDomain({ domain });

const contractCall: xdr.Operation<Operation.InvokeHostFunction> = routerSdk.exec(
  domainOwner,
  [
    new InvocationV0({
      contract: domainsContract,
      method: "burn_record",
      args: [
        xdr.ScVal.scvVec([xdr.ScVal.scvSymbol("Record"), xdr.ScVal.scvBytes(new TextEncoder().encode(value.node))]),
      ],
    }),
    new InvocationV0({
      contract: domainsContract,
      method: "set_record",
      args: [
        nativeToScVal(new TextEncoder().encode(domain), { type: "bytes" }),
        nativeToScVal(new TextEncoder().encode("xlm"), { type: "bytes" }),
        nativeToScVal(value.address, { type: "address" }),
        nativeToScVal(value.address, { type: "address" }),
        nativeToScVal(3600n * 24n * 365n * 5n, { type: "u64" }),
      ],
    }),
  ],
);

// Now you build the transaction, add the operation from above and send it to the network.
```

The best thing about using this method, is that the transaction is also atomic so if something fails in the middle then
the whole transaction fails. Just like with the classic side!

## License

![](https://img.shields.io/badge/License-MIT-lightgrey)

Licensed under the MIT License, Copyright © 2025-present Creit Technologies LLP.

Check out the `LICENSE.md` file for more details.
