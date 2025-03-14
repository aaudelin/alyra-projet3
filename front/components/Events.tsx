
import { useWriteContract, useAccount } from 'wagmi'

const Events = () => {

  const { address, isConnected } = useAccount();
  return (
    <>
    { isConnected && (<main>
        <section className="events-info">
        <div className="proposal-session-header">
            <p className="text-lg">Proposals</p>
        </div>
        <div className="contract-info-text">
            <p><strong>Proposal 1:</strong> 'test'</p>
            <p><strong>Proposal 2:</strong> 'test'</p>
        </div>
        </section>
    </main>)}
  </>
  )
}

export default Events