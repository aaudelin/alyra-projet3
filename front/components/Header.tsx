import { ConnectButton } from '@rainbow-me/rainbowkit';

const Header = () => {
  return (
    <header className="header">
      <h1 className="header-title">DApp Voting</h1>
      <div className="connect-btn">
        <ConnectButton />
      </div>
    </header>
  )
}

export default Header