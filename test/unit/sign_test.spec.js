import "../test_help";
import assert from "assert";
import * as AccountSign from "../../src/background/lib";
import accountSignData from "../data/sign_test.json";
import { signDataV2 } from "../data/sign_data_v2";
const sinon = require("sinon");

global.chrome = {
  storage: {
    local: {
      get: sinon.fake.yields({ netType: "mainnet" }), // Simulate async call with `sinon.fake.yields`
    },
  },
};
describe("Sign Util Test", function () {
  it("sign transaction payment", async function () {
    let signResult = AccountSign.signPayment(
      accountSignData.signPayment.privateKey,
      accountSignData.signPayment.fromAddress,
      accountSignData.signPayment.toAddress,
      accountSignData.signPayment.amount,
      accountSignData.signPayment.fee,
      accountSignData.signPayment.nonce,
      accountSignData.signPayment.memo
    );
    assert.strictEqual(
      JSON.stringify(signResult),
      JSON.stringify(accountSignData.signPayment.result)
    );
  });
  it("sign staking payment", async function () {
    let signStakingResult = AccountSign.stakePayment(
      accountSignData.stakePayment.privateKey,
      accountSignData.stakePayment.fromAddress,
      accountSignData.stakePayment.toAddress,
      accountSignData.stakePayment.fee,
      accountSignData.stakePayment.nonce,
      accountSignData.stakePayment.memo
    );
    assert.strictEqual(
      JSON.stringify(signStakingResult),
      JSON.stringify(accountSignData.stakePayment.result)
    );
  });
});

describe("Sign Util Test 2.0", function () {
  it("sign transaction v2", async function () {
    let signResult = AccountSign.signTransaction(
      signDataV2.testAccount.privateKey,
      {
        ...signDataV2.signPayment.testnet.signParams,
      }
    );
    assert.strictEqual(
      JSON.stringify(signResult),
      JSON.stringify(signDataV2.signPayment.testnet.signResult)
    );
  });

  it("sign stake delegation v2", async function () {
    let signResult = AccountSign.signTransaction(
      signDataV2.testAccount.privateKey,
      {
        ...signDataV2.signStakeTransaction.testnet.signParams,
      }
    );
    assert.strictEqual(
      JSON.stringify(signResult),
      JSON.stringify(signDataV2.signStakeTransaction.testnet.signResult)
    );
  });

  it("sign zk transaction v2", async function () {
    let signResult = AccountSign.signTransaction(
      signDataV2.testAccount.privateKey,
      {
        ...signDataV2.signZkTransaction.testnet.signParams,
      }
    );
    assert.strictEqual(
      JSON.stringify(signResult),
      JSON.stringify(signDataV2.signZkTransaction.testnet.signResult)
    );
  });

  it("sign message mainnet v2", async function () {
    const mainnetData = signDataV2.signMessageData.mainnet;
    let signResult = AccountSign.signTransaction(
      signDataV2.testAccount.privateKey,
      {
        ...mainnetData.signParams,
      }
    );
    assert.strictEqual(
      JSON.stringify(signResult),
      JSON.stringify(mainnetData.signResult)
    );

    const verifyResultMain = AccountSign.verifyMessage({
      publicKey: mainnetData.signParams.publicKey,
      signature: mainnetData.signResult.signature,
      verifyMessage: mainnetData.signResult.data,
    });

    assert.strictEqual(verifyResultMain, true);
  });

  it("sign message testnet v2", async function () {
    const testnettData = signDataV2.signMessageData.testnet;
    let signResult = AccountSign.signTransaction(
      signDataV2.testAccount.privateKey,
      {
        ...testnettData.signParams,
      }
    );
    assert.strictEqual(
      JSON.stringify(signResult),
      JSON.stringify(testnettData.signResult)
    );

    const verifyResultTest = AccountSign.verifyMessage({
      publicKey: signResult.signParams.publicKey,
      signature: signResult.signResult.signature,
      verifyMessage: signResult.signResult.data,
    });

    assert.strictEqual(verifyResultTest, true);
  });
});
