const { expect } = require('chai')
const anchor = require("@project-serum/anchor");
const { NONCE_ACCOUNT_LENGTH } = require('@solana/web3.js');
const { SystemProgram } = anchor.web3; //require("@solana/web3.js");

describe("network-cidadao", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider);
  const program = anchor.workspace.NetworkCidadao;
  const baseAccount = anchor.web3.Keypair.generate();

  it("is initialized!", async () => {
    // Add your test here.
    // generate credentials for generated account:

    const tx = await program.rpc.initialize({
      accounts: {
        baseAccount: baseAccount.publicKey,
        user: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [baseAccount],
    });
    // console.log("\tYour transaction signature", tx);
    expect(tx).to.be.a('string');
    // retrieve info
    // 
  });

  it("is submitting some actions!", async () => {

    const tx = await program.rpc.submitAction(
      'Test 1',
      'A description about the action',
      'Type: Lawsuit',
      {
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
          },
      });
    let account = await program.account.baseAccount.fetch(baseAccount.publicKey);
    // console.log(account.totalActions);
    expect(account.totalActions.toString()).equal((1).toString());
    // console.log(account.pendingActionList);
    console.log('Seconds since 1970, js:')
    console.log(Math.floor(Date.now()/1000));
    console.log('Seconds since 1970, onchain:')
    console.log(parseInt(account.pendingActionList[0].actionRequestedTime.toString()));
  });
  
  // it("reviews an action!", async () => {
    
  //   let comments = ['example', 'questions'];

  //   await program.rpc.reviewAction(
  //       true,
  //       comments,
  //       {
  //         accounts: {
  //           baseAccount: baseAccount.publicKey,
  //           user: provider.wallet.publicKey,
  //           },
  //       });
  // });
});
