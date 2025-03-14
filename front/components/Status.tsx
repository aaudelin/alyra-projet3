const Status = ({ voter, winner, workflowStatus }) => {

    return (
      <>
        {workflowStatus?.toString() === "2" && voter?.isRegistered && (
        <section className="form-section">
            <p className="form-title">Proposals Registration Ended</p>
        </section>
        )}
        {workflowStatus?.toString() === "3" && voter?.isRegistered && voter?.hasVoted && (
        <section className="form-section">
            <div className="voting-session-header"><p className="text-lg">Voting Session</p></div>
            <p className="text-gray-700">You have already voted.</p>
        </section>
        )}

        {workflowStatus?.toString() === "4" && voter?.isRegistered && (
        <section className="form-section">
            <p className="form-title">Voting Session Ended</p>
        </section>
        )}
        {workflowStatus?.toString() === "5" && (
            <section className="form-section">
            <p className="form-title">Votes Tallied</p>
            <p className="text-gray-700">Proposal with the most votes: {winner?.toString()}</p>
            </section>
        )}
    </>
    )
  }
  export default Status