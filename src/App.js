import './css/reset.css';
import './App.css';
import './css/style.css';
import './css/responsive.css';
import {useEffect, useState} from "react";
import connectWallet from "./ConnectWallet";
import { SigningCosmWasmClient } from "secretjs";
import MiddleEarth from "./MiddleEarth";
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import {useLocation} from "react-router-dom";
import Swal from "sweetalert2";

const chainInfo = {
  client: null,

  // Testnet Pulsar-2
  chainId: "pulsar-2",
  chainRPC: "https://rpc.pulsar.griptapejs.com",
  chainREST: "https://api.pulsar.griptapejs.com/cosmos/tx/v1beta1/txs",
  randomMintContractAddress: "secret1h2zadahnmk2ltxl8vq54vt8ytkmp4cqsw27sd9",
  snip20ContractAddress: "secret18vd8fpwxzck93qlwghaj6arh4p7c5n8978vsyg",
  nftContract: "secret15nf83dftyrtrlguvzxmk7cdjaryv4fs7x7avpg",
  //-----//

  // Mainnet Secret-4
  // chainId: "secret-4",
  // chainRPC: "https://rpc-secret.scrtlabs.com/secret-4/rpc",
  // chainREST: "https://api.scrt.network",
  // randomMintContractAddress: "",
  // snip20ContractAddress: "",
  // nftContract: "",
  //-----//

  clientAddress: null,
  permit: null,
  balancePermit: null,
  offlineSigner: null,
}

function App() {

  const [addressContainer, setAddressContainer] = useState(<a className="ctn" href="#" onClick={() => handleConnect()}>Connect Wallet</a>);
  const [sscrtBalance, setSscrtBalance] = useState(0);
  const [sscrtWrapper, setSscrtWrapper] = useState((sscrtBalance / 1000000) + ' $sSCRT');
  const [scrtBalance, setScrtBalance] = useState(0);
  const [scrtWrapper, setScrtWrapper] = useState((scrtBalance / 1000000) + ' $SCRT');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [nftCollection, setNftCollection] = useState([]);
  const [amounttoBuy, setAmounttoBuy] = useState(1);

  const priceForEach = 1000000;

  let location = useLocation();

  useEffect(() => {
    if (location.pathname === '/mycollection') {
      fetchMyCollection();
    }
  }, [location.pathname]);

  useEffect(() => {
    var acc = document.getElementsByClassName("accordion");
    var i;
    for(i = 0; i < acc.length; i++) {
      acc[i].replaceWith(acc[i].cloneNode(true));
      acc[i].addEventListener("click", function() {
        this.classList.toggle("active");
        var panel = this.nextElementSibling;
        if(panel.style.display === "block") {
          panel.style.display = "none";
        } else {
          panel.style.display = "block";
        }
      });
    }

    const connect = async () => {
      await handleConnect();
    }
    connect();
    window.addEventListener("keplr_keystorechange", async () => {
      await handleConnect();
    })
  }, []);

  const toggleMobileMenu = (menu) => {
    setMobileMenuOpen(!mobileMenuOpen);
  }

  const handleConnect = async () => {
    let enigmaUtils
    [chainInfo.clientAddress, chainInfo.offlineSigner, enigmaUtils] = await connectWallet(chainInfo);
    setAddressContainer(<a className="ctn" href="#">{chainInfo.clientAddress.substr(0, 9) + "..." + chainInfo.clientAddress.substr(-3, 3)}</a>)
    chainInfo.client = new SigningCosmWasmClient(
        chainInfo.chainREST,
        chainInfo.clientAddress,
        chainInfo.offlineSigner,
        enigmaUtils
    );
  }

  const getBalance = async () => {
    setSscrtWrapper(<Skeleton
        width={150}
        height={30}
        highlightColor={'#4F4BCF'}
        baseColor={'#5089F9'}
    />);
    setScrtWrapper(<Skeleton
        width={150}
        height={30}
        highlightColor={'#4F4BCF'}
        baseColor={'#5089F9'}
    />);
    if (chainInfo.balancePermit === null || chainInfo.balancePermit === undefined) {
      const { signature } = await window.keplr.signAmino(
          chainInfo.chainId,
          chainInfo.clientAddress,
          {
            chain_id: chainInfo.chainId,
            account_number: "0", // Must be 0
            sequence: "0", // Must be 0
            fee: {
              amount: [{ denom: "uscrt", amount: "0" }], // Must be 0 uscrt
              gas: "1", // Must be 1
            },
            msgs: [
              {
                type: "query_permit", // Must be "query_permit"
                value: {
                  permit_name: "balancePermit",
                  allowed_tokens: [chainInfo.snip20ContractAddress],
                  permissions: ["balance"],
                },
              },
            ],
            memo: "", // Must be empty
          },
          {
            preferNoSetFee: true, // Fee must be 0, so hide it from the user
            preferNoSetMemo: true, // Memo must be empty, so hide it from the user
          }
      );
      chainInfo.balancePermit = signature;
    }

    const msg = {
      with_permit: {
        query: {
          balance: {
            address: chainInfo.clientAddress
          }
        },
        permit: {
          params: {
            permit_name: "balancePermit",
            allowed_tokens: [chainInfo.snip20ContractAddress],
            chain_id: chainInfo.chainId,
            permissions: ["balance"],
          },
          signature: chainInfo.balancePermit,
        }
      }
    }
    const balance = await chainInfo.client.restClient.queryContractSmart(chainInfo.snip20ContractAddress, msg);
    const account = await chainInfo.client.getAccount(chainInfo.clientAddress);
    const scrtBal = account.balance[0].amount;
    //fetch api
    const url = "https://min-api.cryptocompare.com/data/price?fsym=SCRT&tsyms=USD";
    let usd = 0
    try {
      const response = await fetch(url);
      const data = await response.json();
      usd = data.USD;
    } catch (error) {
      console.log(error);
    }
    setSscrtBalance(balance.balance.amount);
    setSscrtWrapper((parseFloat(balance.balance.amount) / 1000000).toFixed(4) + ' sSCRT ($' + ((parseFloat(balance.balance.amount) / 1000000) * usd).toFixed(2) + ')');
    setScrtBalance(balance.balance.amount);
    setScrtWrapper((parseFloat(scrtBal) / 1000000).toFixed(4) + ' SCRT ($' + ((parseFloat(scrtBal) / 1000000) * usd).toFixed(2) + ')');
  }

  const fetchMyCollection = async () => {
    //mock nft data
    //Data should be fetched from the contract and saved into the nftData array
    const nftData = [
      {
        name: "NFT 1",
        id: "#4352",
        background: "white",
        lhand: "none"
      },
      {
        name: "NFT 2",
        id: "#2548",
        background: "green",
        lhand: "Sword"
      },
      {
        name: "NFT 3",
        id: "#2548",
        background: "yellow",
        lhand: "Axe"
      }
    ]

    for (let i = 0; i < nftData.length; i++) {
      let data = {
        attributes: []
      }
      try {
        //construct the URL according to the attributes
        let code = "p5CbBJPQfYHjNq/PxjAEAsebbVjOgP2h2qkk8zQyvd1KDxhLynQgeg=="
        let url = "https://cryptids-testnet.azurewebsites.net/api/attributestatistics?background=" + nftData[i].background + "&lhand=" + nftData[i].lhand + "&code=" + code
        const response = await fetch(url);
        data = await response.json();
      } catch (error) {
        console.log(error);
      }
      nftData[i].scores = data.attributes; //save scores as another object to use in the list
    }
    setNftCollection(nftData);
  }

  const checkWhitelist = async (address) => {
    let data = {
      whitelist: true
    };
    try {
      const code = 'zia7kDoux1zpLWsflavaXR/mfI9rTJjQRmRiJ9bPvBZOwNlqIaOv'
      const url = 'https://cryptids-testnet.azurewebsites.net/api/iswhitelisted?address=' + chainInfo.clientAddress + '&code=' + code
      const response = await fetch(url);
      data = await response.json();
    } catch (error) {
      console.log(error);
    }
    return data.whitelist;
  }

  const handleMint = async () => {

    const whiteListCheck = await checkWhitelist();
    if (!whiteListCheck) {
      Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'You are not whitelisted!',
          }
      )
      return false;
    }

    let msg = Buffer.from(
        JSON.stringify({
          mint: {
            amount_to_mint: amounttoBuy,
            mint_for: chainInfo.clientAddress,
          },
        }),
    ).toString("base64");

    try {
      let tx = await chainInfo.client.execute(
          chainInfo.snip20ContractAddress,
          {
            msg: {
              send: {
                recipient: chainInfo.nftContract,
                amount: (priceForEach * amounttoBuy).toString(),
                msg,
              },
            },
          },
          {
            gasLimit: 500_000,
            gasPriceInFeeDenom: 0.25,
          },
      );
      console.log(
          `Gas used for mintNfts (x${amounttoBuy}): ${JSON.stringify(
              tx.gasUsed,
          )}`,
      );
      return tx.code === 0;
    } catch (e) {
      console.log(`Failed to mint ${e}`);
    }
    return null;

  }

  return (
      <MiddleEarth
          chainInfo={chainInfo}
          addressContainer={addressContainer}
          getBalance={getBalance}
          toggleMobileMenu={toggleMobileMenu}
          mobileMenuOpen={mobileMenuOpen}
          sscrtWrapper={sscrtWrapper}
          scrtWrapper={scrtWrapper}
          nftCollection={nftCollection}
          handleMint={handleMint}
      />
  );
}

export default App;