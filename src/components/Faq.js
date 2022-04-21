const Faq = (props) => {
  return (
      <section id="accordian-background">
        <div className="OUR-TEAM">
          <h3>F.A.Q</h3> </div>
        <div className="faq-set">
          <button className="accordion">WHEN IS THE MINT?</button>
          <div className="panel">
            <p> Part 1 : Minting starts at 12:00 pm UTC on April 21st. (2321 available NFTs, 60% for WL)</p><p>
              Part 2 : Minting starts at 12:00 pm UTC on May 4th. (2000 available NFTs, 60% for WL)</p>
          </div>
          <button className="accordion">HOW MANY PIECES ARE THERE IN THE COUNCIL OF GYLD NFT COLLECTION?</button>
          <div className="panel">
            <p>The collection contains 4321 unique pieces.</p>
          </div>
          <button className="accordion">HOW CAN I CONVERT $SCRT TO $sSCRT USING KEPLR WALLET?</button>
          <div className="panel">
            <p>You can use the guide provided <a target={"_blank"} href="https://www.patlid.com/posts/guide-how-to-convert-scrt-sscrt-keplr-wallet">here</a>.</p>
          </div>
          <button className="accordion">WHAT CAN I DO WITH MY COUNCIL OF GYLD NFT? </button>
          <div className="panel">
            <p>Your Council of Gyld NFT, or your Cryptid, is your access point into the Legendao universe.</p>
            <p>When you collect a Council of Gyld NFT, you initially receive a 2D Cryptid avatar to use on the Legendao platform.</p>
            <p>This will entitle you to a free 3D Cryptid avatar for use in Phase 2 of the Legendao Universe.</p>
            <p>Your 2D Cryptid avatar also grants you Legendao OG status. OGs enjoy amazing NFT and staking opportunities that will never be accessible at any other time except during the initial Council of Gyld drop.</p>
          </div>
          <button className="accordion">IS THE 2D COUNCIL OF GYLD COLLECTION PART OF THE 3D LEGENDAO UNIVERSE? </button>
          <div className="panel">
            <p>Yes. The 2D Council of Gyld collection is the technical base for the 3D Cryptids collection and currently interacts with the Legendao platform in most of the 3D capacities like collecting, staking and earning XP.</p>
          </div>
          <button className="accordion">WHY SHOULD I BUY A COUNCIL OF GYLD NFT? </button>
          <div className="panel">
            <p>It looks awesome and the free 3D avatar dropped to you later will look even more awesome.</p>
            <p>A Council of Gyld NFT is the initial key entitling you to staking, collecting and earning privileges that will never be available again after the initial drop.</p>
            <p>With your Council of Gyld NFT, you get a whitelist spot for Legendao's first blue-chip NFT collection and a free digital wearable - an exclusive pair of wings that will mark you forever as a Legendao OG.</p>
            <p>There will be no way to buy or transfer the perks provided by the Council of Gyld drop ever again.</p>
          </div>
        </div>
      </section>
  );
};

export default Faq;