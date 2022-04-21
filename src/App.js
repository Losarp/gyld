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
//import {getAllNftDetails} from "./components/snip721";
import { db } from "./firebase";
import { collection, onSnapshot, updateDoc, doc } from "firebase/firestore";

const chainInfo = {
  client: null,

  // Testnet Pulsar-2
  chainId: process.env["REACT_APP_CHAIN_ID"],
  chainRPC: process.env["REACT_APP_CHAIN_RPC"],
  chainREST: process.env["REACT_APP_CHAIN_REST"],
  randomMintContractAddress: process.env["REACT_APP_MINTING_CONTRACT"],
  snip20ContractAddress: process.env["REACT_APP_TOKEN_CONTRACT"],
  nftContract: process.env["REACT_APP_NFT_CONTRACT"],
  priceForEach: process.env["REACT_APP_MINT_PRICE"],
  backendService: process.env["REACT_APP_BACKEND_SERVICE"],
  //-----//

  // Mainnet Secret-4
  // chainId: "secret-4",
  // chainRPC: "https://rpc-secret.scrtlabs.com/secret-4/rpc",
  // chainREST: "https://api.scrt.network",
  // randomMintContractAddress: "",
  // snip20ContractAddress: "secret1k0jntykt7e4g3y88ltc60czgjuqdy4c9e8fzek",
  // nftContract: "",
  // priceForEach: "1000000",
  //-----//

  clientAddress: null,
  permit: null,
  balancePermit: null,
  offlineSigner: null,
}

function App() {

  const [addressContainer, setAddressContainer] = useState(<a className="ctn" href="#popup2" onClick={() => handleConnectButton()}>Connect Wallet</a>);
  const [sscrtBalance, setSscrtBalance] = useState(0);
  const [sscrtWrapper, setSscrtWrapper] = useState((sscrtBalance / 1000000) + ' $sSCRT');
  const [scrtBalance, setScrtBalance] = useState("0");
  const [scrtWrapper, setScrtWrapper] = useState((scrtBalance / 1000000) + ' $SCRT');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [nftCollection, setNftCollection] = useState([]);
  //const [amounttoBuy, setAmounttoBuy] = useState(1);
  const [mintVisibleClass, setMintVisibleClass] = useState('');
  const [mintCount, setMintCount] = useState(1);
  const [totalMints, setTotalMints] = useState(0);

  let location = useLocation();

  useEffect(() => {
    onSnapshot(collection(db, 'legendao'), async (snapshot) => {
      setTotalMints(snapshot.docs[0].data().mintCount);
    })
    console.log(totalMints)
  }, [totalMints])

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
    window.addEventListener('click', ({ target }) => {
      const isClosest = target.closest('.popup');

      if (!isClosest) {
        if (document.getElementById('popup1').classList.contains('mint-visible')) {
          document.getElementById('popup1').classList.remove('mint-visible');
        }
      }
    });

    const connect = async () => {
      await handleConnect();
    }
    connect();
    window.addEventListener("keplr_keystorechange", async () => {
      await handleConnect();
    })
  }, []);

  const handleSetCounter = async (count) => {
    const mint_count_db = doc(db, 'legendao', 'LegendaoMintCounter');
    await updateDoc(mint_count_db, {
      mintCount: count
    })
    setTotalMints(count);
  }

  const toggleMobileMenu = (menu) => {
    setMobileMenuOpen(!mobileMenuOpen);
  }

  const handleConnectButton = async () => {
    await handleConnect();
    await getBalance();
  }

  const handleConnect = async () => {
    let enigmaUtils
    [chainInfo.clientAddress, chainInfo.offlineSigner, enigmaUtils] = await connectWallet(chainInfo);
    setAddressContainer(<a onClick={() => getBalance()} className="ctn" href="#popup2">{chainInfo.clientAddress.slice(0, 9) + "..." + chainInfo.clientAddress.slice(-3)}</a>)
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
    if (localStorage.getItem('permit') === null || localStorage.getItem('permit') === undefined) {
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
                  permit_name: "gyld",
                  allowed_tokens: [chainInfo.snip20ContractAddress],
                  permissions: ["balance", "owner"],
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
      localStorage.setItem("permit", signature);
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
            permit_name: "gyld",
            allowed_tokens: [chainInfo.snip20ContractAddress],
            chain_id: chainInfo.chainId,
            permissions: ["balance", "owner"],
          },
          signature: localStorage.getItem('permit'),
        }
      }
    }
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
    getSscrtBalance(msg, usd);
    const account = await chainInfo.client.getAccount(chainInfo.clientAddress);
    const scrtBal = account.balance[0].amount;
    setScrtBalance(parseFloat(scrtBal).toFixed(4));
    setScrtWrapper((parseFloat(scrtBal) / 1000000).toFixed(4) + ' SCRT ($' + ((parseFloat(scrtBal) / 1000000) * usd).toFixed(2) + ')');
  }

  const getSscrtBalance = async (msg, usd) => {
    const balance = await chainInfo.client.restClient.queryContractSmart(chainInfo.snip20ContractAddress, msg);
    setSscrtBalance(balance.balance.amount);
    setSscrtWrapper((parseFloat(balance.balance.amount) / 1000000).toFixed(4) + ' sSCRT ($' + ((parseFloat(balance.balance.amount) / 1000000) * usd).toFixed(2) + ')');
  }

  const fetchMyCollection = async () => {
    //mock nft data
    if (!window.keplr) {
      Swal.fire({
        title: 'Missing Keplr',
        text: 'Please install Keplr extension',
        icon: 'warning'
      })
      return false;
    } else {

      if (chainInfo.clientAddress === null) {
        //wait for chainInfo.clientAddress
        setTimeout(() => {
          fetchMyCollection();
        }, 1000);
        return false;
      }

      if (localStorage.getItem('permit') === null || localStorage.getItem('permit') === undefined) {

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
                    permit_name: "gyld",
                    allowed_tokens: [chainInfo.nftContract],
                    permissions: ["balance", "owner"],
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
        localStorage.setItem('permit', signature);
      }

      //setModalContent(() => (<div className="dog-loader-test">Checking your dogs...</div>))
      Swal.fire({
        title: 'Checking...',
        didOpen: () => {
          Swal.showLoading()
        }
      });

      let tokens = [];
      try {
        tokens = await chainInfo.client.queryContractSmart(
            chainInfo.nftContract,
            {
              with_permit: {
                query: {
                  "tokens": {
                    "owner": chainInfo.clientAddress,
                    "limit": 4444
                  }
                },
                permit: {
                  params: {
                    permit_name: "gyld",
                    allowed_tokens: [chainInfo.nftContract],
                    chain_id: chainInfo.chainId,
                    permissions: ["balance", "owner"],
                  },
                  signature: localStorage.getItem('permit')
                },
              },
            }
        );
      } catch (e) {
        console.log(e);
        Swal.fire({
          title: 'Contract Error',
          text: e,
          icon: 'error'
        })
        return false;
      }


      const allTokens = tokens.token_list.tokens

      if (allTokens.length < 1) {
        Swal.fire({
          title: 'You have no NFTs yet!',
          didOpen: () => {
            Swal.hideLoading()
          }
        });
        return false
      }
      Swal.fire({
        title: 'Acquiring...',
        didOpen: () => {
          Swal.showLoading()
        }
      });

      let myTokens = []

      for (let i = 0; i < allTokens.length; i++) {
        // for (let i = 0; i < 2; i++) {
        // console.log(allTokens[i])
        const msg = {
          with_permit: {
            query: {
              "nft_dossier": {
                "token_id": allTokens[i]
              }
            },
            permit: {
              params: {
                permit_name: "gyld",
                allowed_tokens: [chainInfo.nftContract],
                chain_id: chainInfo.chainId,
                permissions: ["balance", "owner"],
              },
              signature: localStorage.getItem('permit')
            }
          }
        }

        let singleToken = await chainInfo.client.restClient.queryContractSmart(chainInfo.nftContract, msg);
        // console.log(dog)
        singleToken['token_id'] = allTokens[i];
        myTokens.push(singleToken);
      }
      if (myTokens.length > 0) {
        // console.log(`tokens: ${JSON.stringify(myTokens)}`)
        Swal.close();

        for (let i = 0; i < myTokens.length; i++) {
          let data = {
            attributes: []
          }
          try {

            let attrs = myTokens[i].nft_dossier.public_metadata.extension.attributes.map(
                (attr) => {
                  if (attr?.trait_type && attr?.value) {
                    return `${attr.trait_type}=${attr.value}`;
                  }
                }
            ).reduce((previousValue, currentValue) => `${previousValue}&${currentValue}`);

            // todo: remove this when working with real data
            attrs="background=Night&bull_bottom_hand=Hammer&bull_head=Ram Horns White"

            //construct the URL according to the attributes
            let url = `${chainInfo.backendService}/attributestatistics?${attrs}`

            const response = await fetch(url);
            data = await response.json();
          } catch (error) {
            console.log(error);
          }
          myTokens[i].scores = data.attributes; //save scores as another object to use in the list

          try {
            //construct the URL according to the attributes
            let url = `${chainInfo.backendService}/tokenstatistics?token=${myTokens[i].token_id}`

            const response = await fetch(url);
            data = await response.json();
          } catch (error) {
            console.log(error);
          }
          myTokens[i].totals = data.score; //save scores as another object to use in the list


        }
        setNftCollection(myTokens);
      } else {
        Swal.fire({
          title: 'You have no NFTs yet!',
          didOpen: () => {
            Swal.hideLoading()
          }
        });
      }
    }
  }

//   const fetchMyCollection = async () => {
//     //mock nft data
//     //Data should be fetched from the contract and saved into the nftData array
//     let permit = chainInfo.permit;
//
//     if (!permit) {
//       const { signature } = await window.keplr.signAmino(
//           chainInfo.chainId,
//           chainInfo.clientAddress,
//           {
//             chain_id: chainInfo.chainId,
//             account_number: "0", // Must be 0
//             sequence: "0", // Must be 0
//             fee: {
//               amount: [{ denom: "uscrt", amount: "0" }], // Must be 0 uscrt
//               gas: "1", // Must be 1
//             },
//             msgs: [
//               {
//                 type: "query_permit", // Must be "query_permit"
//                 value: {
//                   permit_name: "nft-view-permit",
//                   allowed_tokens: [chainInfo.nftContract],
//                   permissions: ["owner"],
//                 },
//               },
//             ],
//             memo: "", // Must be empty
//           },
//           {
//             preferNoSetFee: true, // Fee must be 0, so hide it from the user
//             preferNoSetMemo: true, // Memo must be empty, so hide it from the user
//           }
//       );
//       chainInfo.permit = {signature, params: {
//           permit_name: "nft-view-permit",
//           allowed_tokens: [chainInfo.nftContract],
//           permissions: ["owner"],
//           chain_id: chainInfo.chainId
//       }};
//     }
//
//     if (!chainInfo.permit) {
//       console.log("failed to save permit`);
//       return;
//     }
//
//     const tokens = await chainInfo.client.restClient.queryContractSmart(chainInfo.nftContract, {
//       with_permit: {
//         permit: chainInfo.permit,
//         query: {
//           tokens: {
//             owner: chainInfo.clientAddress,
//           },
//         },
//         // limit: 10
//       },
//     });
//
//     let token_ids = tokens?.token_list?.tokens;
//
//     if (!token_ids) {
//       return;
//     }
//     const details = await getAllNftDetails(token_ids, chainInfo.client, chainInfo.clientAddress, chainInfo.nftContract, permit);
//
//     console.log(`details: ${JSON.stringify(details)}`);
// //const nftData = [
// //       {
// //         id: "#4352",
// //         name: `NFT #${details.id}`,
// //         details: "white",
// //         lhand: "none"
// //       },
// //       {
// //         name: "NFT 2",
// //         id: "#2548",
// //         background: "green",
// //         lhand: "Sword"
// //       },
// //       {
// //         name: "NFT 3",
// //         id: "#2548",
// //         background: "yellow",
// //         lhand: "Axe"
// //       }
// //     ];
//     let nftData = details.map(item => {
//       return {
//         id: item.id,
//         name: item.all_nft_info.info.name,
//         attributes: item.all_nft_info.info.attributes,
//         image: item.all_nft_info.info.extension.image
//       };
//     });
//
//     for (let i = 0; i < nftData.length; i++) {
//       let data = {
//         attributes: []
//       }
//       try {
//         //construct the URL according to the attributes
//         let code = "p5CbBJPQfYHjNq/PxjAEAsebbVjOgP2h2qkk8zQyvd1KDxhLynQgeg=="
//         let url = "https://cryptids-testnet.azurewebsites.net/api/attributestatistics?background=" + nftData[i].background + "&lhand=" + nftData[i].lhand + "&code=" + code
//         const response = await fetch(url);
//         data = await response.json();
//       } catch (error) {
//         console.log(error);
//       }
//       nftData[i].scores = data.attributes; //save scores as another object to use in the list
//     }
//     setNftCollection(nftData);
//   }

  const checkWhitelist = async () => {
    let data = {
      whitelist: false
    };
    try {
      const code = 'zia7kDoux1zpLWsflavaXR/mfI9rTJjQRmRiJ9bPvBZOwNlqIaOvmQ=='
      const url = 'https://cryptids-testnet.azurewebsites.net/api/iswhitelisted?address=' + chainInfo.clientAddress + '&code=' + code
      const response = await fetch(url);
      data = await response.json();
    } catch (error) {
      console.log(error);
    }
    return data.whitelist;
  }

  const toggleMintVisible = () => {
    if (mintVisibleClass === "") {
      showMintSuccess()
    } else {
      hideMintSuccess()
    }
  }

  const hideMintSuccess = () => {
    setMintVisibleClass("");
  }
  const showMintSuccess = () => {
    setMintVisibleClass("mint-visible");
  }

  const handleMint = async (mintCount) => {


    //use mintCount variable to query the contract for "mintCount" number of mints.

    hideMintSuccess();
    const whiteListCheck = await checkWhitelist();
    console.log(`is whitelisted: ${whiteListCheck}`);
    if (!whiteListCheck) {
      Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'You are not whitelisted!',
          }
      )
      return false;
    }

    let msg = btoa(JSON.stringify({
          mint: {
            amount_to_mint: Number(mintCount),
            mint_for: chainInfo.clientAddress,
          },
        }),
    );

    try {
      let tx = await chainInfo.client.execute(
          chainInfo.snip20ContractAddress,
          {
              send: {
                recipient: chainInfo.randomMintContractAddress,
                amount: (Number(chainInfo.priceForEach) * mintCount).toString(),
                msg,
              },
          },
          "",
          [],
          {
            gas: 50_000 + (Number(mintCount) * 50_000),
            amount: {
              denom: "uscrt",
              amount: 6250
            },
          },
      );
      //console.log(`resp: ${JSON.stringify(tx)}`);
      console.log(`mint successful`);
      showMintSuccess()
    } catch (e) {
      console.log(`Failed to mint: ${e}`);

      //let eText = e.toString();

      if (e.message.includes('insufficient funds')) {
        Swal.fire({
              icon: 'error',
              title: 'Failed to mint',
              text: 'Insufficient sSCRT balance',
            }
        )
      }
      else if (e.message.includes('out of gas')) {
        Swal.fire({
              icon: 'error',
              title: 'Failed',
              text: 'Out of gas. Try increasing the gas amount set by Keplr',
            }
        )
      }
      else if (e.message.includes('Request rejected')) {
      }
      else if (e.message.includes('Address is not whitelisted')) {
        Swal.fire({
              icon: 'error',
              title: 'Failed',
              text: 'Address is not whitelisted or has already minted the maximum amount',
            }
        )
      }
      else {
        /*Swal.fire({
              icon: 'error',
              title: 'Failed',
              text: 'Please try again',
            }
        )*/
      }
    }
    const countMsg = {
      num_tokens: {}
    }
    const resultCount = await chainInfo.client.queryContractSmart(chainInfo.nftContract, countMsg)
    await handleSetCounter(resultCount.num_tokens.count)
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
          mintVisibleClass={mintVisibleClass}
          toggleMintVisible={toggleMintVisible}
          mintCount={mintCount}
          setMintCount={setMintCount}
          totalMints={totalMints}
      />
  );
}

export default App;
