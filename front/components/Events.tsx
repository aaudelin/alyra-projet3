
import { useAccount } from 'wagmi'
import { Proposal } from './Bank';
interface EventsProps {
  proposals: Proposal[];
}

const Events = ({ proposals }: EventsProps) => {

  const { isConnected } = useAccount();

  return (
    <>
    { isConnected && (<main>
        <section className="events-info">
        <div className="proposal-session-header">
            <p className="text-lg">Live Results</p>
        </div>
        <div className="contract-info-text">
          {proposals.map((proposal, index: number) => {
            return (
                <div key={index} className="p-4 mb-3 border rounded-lg shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-gray-800">
                    <div className="flex items-center text-yellow-500 justify-between mb-2">
                            {proposal.description}
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            ID: {proposal.id?.toString()}
                        </span>
                    </div>
                    <p className="font-bold text-lg text-gray-900 dark:text-white">
                        {proposal.voteCount.toString()} Votes
                    </p>
                </div>)
          })}
        </div>
        </section>
    </main>)}
  </>
  )
}

export default Events