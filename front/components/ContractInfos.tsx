const ContractInfos = ({ workflowStatus, owner }) => {
  return (
    <>
    {workflowStatus && (
    <main>
        <section className="contract-info">
        <div className="contract-info-header">
            <p className="text-lg">Contract Informations</p>
        </div>
        <div className="contract-info-text">
            <p><strong>Current Status:</strong> {workflowStatus}</p>
            <p><strong>Owner:</strong> {owner?.toString()}</p>
        </div>
        </section>
    </main>
    )}
  </>

  )
}

export default ContractInfos