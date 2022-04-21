import Header from "./components/Header";
import Services from "./components/Services";
import Roadmap from "./components/Roadmap";
import Faq from "./components/Faq";
import Team from "./components/Team";
import Footer from "./components/Footer";
import Popups from "./components/Popups";
import Hero from "./components/Hero";
import MyCollection from "./components/MyCollection";
import {Route, Routes} from "react-router-dom";

const MiddleEarth = (props) => {
    return (
        <div>
            <div>
                <Header
                    addressContainer={props.addressContainer}
                    getBalance={props.getBalance}
                    toggleMobileMenu={props.toggleMobileMenu}
                    mobileMenuOpen={props.mobileMenuOpen}
                />
                <Routes>
                    <Route strict path="/" element={<Homepage
                                                        handleMint={props.handleMint}
                                                        totalMints={props.totalMints}
                                                    />}
                    />
                    <Route path="/mycollection" element={<MyCollection nftCollection={props.nftCollection}/>} />
                </Routes>
                <Footer />
                <Popups
                    sscrtWrapper={props.sscrtWrapper}
                    scrtWrapper={props.scrtWrapper}
                    mintVisibleClass={props.mintVisibleClass}
                    toggleMintVisible={props.toggleMintVisible}
                    handleMint={props.handleMint}
                    mintCount={props.mintCount}
                    setMintCount={props.setMintCount}
                />
            </div>
        </div>
    )
}

const Homepage = (props) => {
    return (
        <div>
            <Hero
                handleMint={props.handleMint}
                totalMints={props.totalMints}
            />
            <Services />
            <Roadmap />
            <Faq />
            <Team />
        </div>
    )
}

export default MiddleEarth;