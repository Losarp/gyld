import {Link, NavLink} from "react-router-dom";
const Popups = (props) => {

    const handleSetMintCount = (e) => {
        let val = e.target.value;
        //change every character except 1,2,3,4 to ""
        val = val.replace(/[^1-4]/g, "");
        if (val.length > 1) {
            val = val.substring(0, 1);
        }
        props.setMintCount(val);
    }

    const setMaxMintCount = () => {
        props.setMintCount(4);
    }

    const fireMint = () => {
        if (props.mintCount < 1 || props.mintCount > 4) {
            return false;
        }
        props.handleMint(props.mintCount);
    }

    return(
        <section>
            <div id="popup1" className={"overlay-mint " + props.mintVisibleClass}>
                <div className="popup-width">
                    <div className="popup">
                        <h2>Mint Successful!</h2> <a className="close" href="#" onClick={() => props.toggleMintVisible()}>×</a>
                        <div className="content mintbox-content"> Congratulations! You’ve successfully minted an NFT!</div>
                        <div className="popupBtn"><Link className="bark" to="/mycollection">See my NFT</Link> <a onClick={() => props.handleMint(1)} className="light"
                                                                                                 href="#">Mint
                            Again</a></div>
                    </div>
                </div>
            </div>
            {/* popup behance */}
            <div id="popup2" className="overlay">
                <div className="popup-width">
                    <div className="popup">
                        <h2>Balance</h2> <a className="close" href="#">×</a>
                        <div className="content">
                            <div className="innercontent"><img src="Group 718.png"/>
                                <p>{props.scrtWrapper}</p>
                            </div>
                            <div className="innercontent"><img src="Group 718.png"/>
                                <p>{props.sscrtWrapper}</p>
                            </div>
                        </div>
                        <div className="popupBtn"><a className="barkbehance" href="https://www.patlid.com/posts/guide-how-to-convert-scrt-sscrt-keplr-wallet">Swap SCRT</a></div>
                    </div>
                </div>
            </div>
            <div id="popup3" className={"overlay"}>
                <div className="popup-width">
                    <div className="popup">
                        <h2>Minting</h2> <a className="close" href="#">×</a>
                        <div className="content mintbox-content" style={{marginBottom:'1rem'}}>How many NFTs do you want to mint?</div>
                        <div>
                            <input type="text" onChange={(e) => handleSetMintCount(e)} value={props.mintCount} className={"form-control"} style={{width:'6rem', height:'1rem', paddingRight:'5px', fontSize:'14px'}}/><a className={"light"} onClick={() => setMaxMintCount()} style={{padding:'2px 5px', fontSize:'12px', cursor:'pointer', marginLeft:'0.5rem'}}>Max</a>
                            <div className="content mintbox-content" style={{marginBottom:'2rem', marginTop:'0.4rem', marginLeft:'0.2rem'}}>(Up to four)</div>
                        </div>
                        <div className="popupBtn"><a onClick={() => fireMint()} className="light" href="#">Mint</a></div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Popups;