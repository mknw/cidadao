import React, { useEffect, useState } from 'react';
// import twitterLogo from './assets/twitter-logo.svg';
import cidadao_logo from './assets/cidadaoLOGOTYPE.svg';
import cidadao_slogan from './assets/cidadaoLOGOTYPEslogan.svg';
import './App.css';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { Program, Provider, web3 } from '@project-serum/anchor';
import kp from './keypair.json';

import idl from './idl.json';

// SystemPRogram is a reference to the Solana runtime.
const { SystemProgram } = web3;

// Create a keypair for the account that will hold the GIF data.
// let baseAccount = Keypair.generate();
const arr = Object.values(kp._keypair.secretKey)
const secret = new Uint8Array(arr)
const baseAccount = web3.Keypair.fromSecretKey(secret)


// Get our program's id from the IDL file.
const programID = new PublicKey(idl.metadata.address);

// Set our network to devnet.
const network = clusterApiUrl('devnet');

// Controls how we want to acknowledge when a transaction is "done".
const opts = {
  preflightCommitment: 'processed',
}

// Constants
// const TWITTER_HANDLE = 'dao_cidadao';
// const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const App = () => {

  const [walletAddress, setWalletAddress] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [actionList, setActionList] = useState([]);

  const checkIfWalletIsConnected = async () => {
    try {
      const { solana } = window;

      if (solana) {
        if (solana.isPhantom) {
          console.log('Phantom wallet found!');
          const response = await solana.connect({onlyIfTrusted: true});
          console.log(
            'Connected with Public Key:',
            response.publicKey.toString()
          );
          setWalletAddress(response.publicKey.toString());
        } 
      } else {
          alert('Solana object not found Get a Phantom Wallet! 👻');
      }
    } catch (error) {
      console.log(error);
    }
  };

  const connectWallet = async () => {
    const { solana } = window;

    if (solana) {
      const response = await solana.connect();
      console.log('Connected with Public Key:', response.publicKey.toString());
      setWalletAddress(response.publicKey.toString());
    }
  };

  const renderNotConnectedContainer = () => (
    <button
      className='cta-button connect-wallet-button'
      onClick={connectWallet}
    >Connect to Wallet
    </button>
  );

  const onInputChange = (event) => {
    const { value } = event.target;
    setInputValue(value);
  }
  
  const getProvider = () => {
    const connection = new Connection(network, opts.preflightCommitment);
    const provider = new Provider(
      connection, window.solana, opts.preflightCommitment,
    );
    return provider;
  }
  
  const createCidadaoAccount = async () => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      console.log('ping');
      await program.rpc.initialize({
        accounts: { 
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey, 
          systemProgram: SystemProgram.programId,
        },
        signers: [baseAccount],
      });
      console.log("Created a new BaseAccount with address: ", baseAccount.publicKey.toString());
      await getActionList();
    } catch(error) {
      console.log('Error creating BaseAccount account: ', error)
    }
  }

  const sendAction = async () => {
    if (inputValue.length === 0) {
      console.log("No input was given!")
      return
    }
    setInputValue('');
    console.log('action details:', inputValue);
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);

      await program.rpc.addAction(inputValue, {
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
        },
      });
      console.log('Action successfully sent to program', inputValue)
      
      await getActionList();
    } catch(error) {
      console.log('Error sending Action:', error)
    }
  }

  const renderConnectedContainer = () => {
    if (actionList == null) {
      return (
        <div className ='connected-container'>
          <button className='cta-button submit-gif-button' onClick={createCidadaoAccount}>
          Do One-Time Initialization For CIDADAO Program account
          </button>
        </div>
      )
    } else {
      return(
        <div className='connected-container'>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              sendAction();
            }}
          >
            <input type='text' 
              placeholder='Name your action'
              value={inputValue}
              onChange={onInputChange}
            />
            <button type='submit' className='cta-button submit-gif-button'>Submit</button>
          </form>
          <div className='gif-grid'>
            {actionList.map((item, index)=> (
              <div className='gif-item' key={index}>
                <img src={item.gifLink} alt=''/>
              </div>
            ))}
          </div>
        </div>
      )
  }};


  /*
   * When our component first mounts, let's check to see if we have a connected
   * Phantom Wallet
   */
  useEffect(() => {
    const onLoad = async () => {
      await checkIfWalletIsConnected();
    };
    window.addEventListener('load', onLoad);
    return () => window.removeEventListener('load', onLoad)
  }, []);
  
  /* 
    * Get GIFS
  */
  const getActionList = async() => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      const account = await program.account.baseAccount.fetch(baseAccount.publicKey);

      console.log("Got the account", account)
      setActionList(account.approvedActionList)
    } catch(error) {
      console.log("Error in getActionList:", error)
      setActionList(null);
    }
  };

  useEffect(() => {
    if (walletAddress) {
      console.log('Fetching Action List...');
      getActionList();
    }
  }, [walletAddress]);
  
  return (
    <div className="App">
      <div className={walletAddress ? 'authed-container' : 'container'}>
        <div className="header-container">
          <img alt="CIDADAO" className="cidadao-logo" src={cidadao_slogan} />
          {/* <p className="header">CIDADAO</p> */}
          <p className="sub-text">
            Engage with your community to uphold its Human Rights.
          </p>
          {!walletAddress && renderNotConnectedContainer()}
          {walletAddress && renderConnectedContainer()}
        </div>
        {/* <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built on @${TWITTER_HANDLE}`}</a>
        </div> */}
      </div>
    </div>
  );
};

export default App;