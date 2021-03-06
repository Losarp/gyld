import {HashLink as Link} from "react-router-hash-link";

const Header = (props) => {
    return(
        <section id="header-background">
            <header>
                <div id="brand">
                    <a href={"https://legendao.io"} rel="noreferrer" target={"_blank"}><img src="./image/Cryptids.png" alt={""} className="logo"/></a>
                </div>
                <nav>
                    <ul className="nav-list">
                        <li><Link to={"/"}>Homepage</Link></li>
                        <li><Link to={"/mycollection"}>My Collection</Link></li>
                        <li><Link smooth to="/#roadmap-background"> Roadmap</Link></li>
                        <li><Link smooth to="/#accordian-background">F.A.Q.</Link></li>
                        {/*<li><Link smooth to="/#team-footer-background">Our Team</Link></li>*/}
                        {/*<li><img src="./image/stashh.png" alt="" /></li>*/}
                        <li><a href={"https://discord.gg/w84egv2Enb"} rel="noreferrer" target={"_blank"}><img src="./image/discord.png" alt="" /></a></li>
                        <li><a href={"https://twitter.com/LegendaoNFT"} rel="noreferrer" target={"_blank"}><img src="./image/twitter.png" alt="" /></a></li>
                        {props.addressContainer}
                        {/*<a className="ctn" href="#popup2" onClick={() => props.getBalance()}>Balance</a>*/}
                    </ul>
                </nav>
                <div id="hamburger-icon" onClick={(e) => props.toggleMobileMenu(e)} className={props.mobileMenuOpen? 'open' : ''}>
                    <div className="bar1"/>
                    <div className="bar2"/>
                    <div className="bar3"/>
                    <ul className="mobile-menu">
                        <li><Link to="/">Homepage</Link></li>
                        <li><Link to="/mycollection">My Collection</Link></li>
                        <li><Link smooth to="/#roadmap-background"> Roadmap</Link></li>
                        <li><Link smooth to="/#accordian-background">F.A.Q.</Link></li>
                        {/*<li><Link smooth to="/#team-footer-background">Our Team</Link></li>*/}
                        <div className="social-icons">
                            {/*<li><img src="./image/stashh.png" alt="" /></li>*/}
                            <li><img src="./image/discord.png" alt="" /></li>
                            <li><img src="./image/twitter.png" alt="" /></li>
                        </div>
                        <div className="mobile-btn">{props.addressContainer}
                            {/*<a className="ctn" href="#popup2" onClick={() => props.getBalance()}>Balance</a>*/}
                        </div>
                    </ul>
                </div>
            </header>
            {/* nav bar end */}
        </section>
    )
}

export default Header;